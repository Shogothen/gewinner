// ── beamer.js — render-only surface, driven by the control window ─────────
import { WINNERS, DONATION, COPY, VALUES, STAGE_LABELS, HOST_LINES, makeChannel, escapeHtml } from "./shared.js";

const pickLine = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "");

const chan = makeChannel();
const $ = (id) => document.getElementById(id);

let _lastKey = null;      // detects a genuinely new stage (for one-shot effects)
let _confettiFired = null; // which reveal index already got confetti

// ── confetti (canvas, no dependencies) ───────────────────────────────────
const confetti = (() => {
  const cv = $("confetti");
  const ctx = cv ? cv.getContext("2d") : null;
  let parts = [], raf = null, stopAt = 0;
  const COLORS = ["#F7A823", "#FF6B4A", "#F0464B", "#FFD15C", "#ffffff", "#1a1a1a"];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function resize() { if (!cv) return; cv.width = window.innerWidth; cv.height = window.innerHeight; }
  window.addEventListener("resize", resize);
  function spawn(n) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * cv.width,
        y: -20 - Math.random() * cv.height * 0.3,
        r: 5 + Math.random() * 8,
        c: pick(COLORS),
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: -0.2 + Math.random() * 0.4,
        shape: Math.random() > 0.5 ? "rect" : "circ",
      });
    }
  }
  function frame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.shape === "rect") ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
    parts = parts.filter((p) => p.y < cv.height + 30);
    if (Date.now() < stopAt && parts.length < 260) spawn(6);
    if (parts.length > 0 || Date.now() < stopAt) raf = requestAnimationFrame(frame);
    else { cv.classList.remove("show"); raf = null; }
  }
  return {
    burst(ms) {
      if (!cv) return;
      resize(); cv.classList.add("show");
      stopAt = Date.now() + (ms || 3800);
      spawn(130);
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop() {
      if (!cv) return;
      stopAt = 0; parts = [];
      if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
      cv.classList.remove("show");
    },
  };
})();

// ── sound (Web Audio, synthesised — copyright-clean) ─────────────────────
const sound = (() => {
  let ctx = null, enabled = false, master = null;
  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      } catch (e) {}
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
  }
  function blip({ freq, to, type = "triangle", dur = 0.14, vol = 0.2, delay = 0 }) {
    if (!enabled || !ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  return {
    enable() { ensure(); enabled = true; },
    disable() { enabled = false; },
    isOn() { return enabled; },
    // soft step between slides
    step() { blip({ freq: 587, dur: 0.09, vol: 0.12 }); },
    // building tension on the envelope screen
    suspense() {
      [392, 494, 587].forEach((f, i) => blip({ freq: f, dur: 0.22, vol: 0.13, delay: i * 0.16 }));
    },
    // the big reveal
    reveal() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => blip({ freq: f, type: "square", dur: 0.14, vol: 0.18, delay: i * 0.075 }));
      [523, 659, 784, 1047].forEach((f) =>
        blip({ freq: f, type: "triangle", dur: 0.75, vol: 0.13, delay: 0.34 }));
    },
    // warm chord for the donation moment
    warm() {
      [392, 494, 587, 784].forEach((f, i) =>
        blip({ freq: f, type: "sine", dur: 0.9, vol: 0.12, delay: i * 0.05 }));
    },
    // closing flourish
    close() {
      const mel = [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.44]];
      mel.forEach(([f, d]) => blip({ freq: f, type: "triangle", dur: 0.3, vol: 0.17, delay: d }));
    },
  };
})();

// ── static content that never changes ────────────────────────────────────
function paintStatic() {
  $("open-kicker").textContent = COPY.openKicker;
  $("open-title").textContent = COPY.openTitle;
  $("open-sub").textContent = COPY.openSub;
  $("values-kicker").textContent = COPY.valuesKicker;
  $("close-kicker").textContent = COPY.closeKicker;
  $("close-title").textContent = COPY.closeTitle;
  $("close-sub").textContent = COPY.closeSub;

  $("values-grid").innerHTML = VALUES.map((v) => `
    <div class="value-card">
      <h3>${escapeHtml(v.name)}</h3>
      <p>${escapeHtml(v.blurb)}</p>
    </div>`).join("");

  $("don-kicker").textContent = DONATION.headline;
  $("don-amount").textContent = DONATION.amount;
  $("don-body").textContent = DONATION.body;
  $("don-note").textContent = DONATION.note;
  $("don-names").innerHTML = WINNERS.map((w) =>
    `<span class="don-chip">${escapeHtml(w.name)}</span>`).join("");
  $("close-names").innerHTML = WINNERS.map((w) =>
    `<span class="close-name">${escapeHtml(w.name)}</span>`).join("");
}
paintStatic();

const VIEWS = {
  open: "v-open", values: "v-values", envelope: "v-envelope",
  reveal: "v-reveal", laudatio: "v-laudatio", donation: "v-donation", close: "v-close",
};

function render(s) {
  document.body.classList.add("connected");
  const stage = s.stage || { type: "open" };
  const key = `${stage.type}:${stage.winner ?? ""}`;
  const isNew = key !== _lastKey;
  _lastKey = key;

  // show only the active view
  Object.values(VIEWS).forEach((id) => $(id).classList.remove("show"));
  const active = VIEWS[stage.type] || "v-open";
  $(active).classList.add("show");

  $("stage-tag").textContent =
    `${STAGE_LABELS[stage.type] || ""} · ${(s.index ?? 0) + 1}/${s.total ?? 1}`;

  const w = stage.winner != null ? WINNERS[stage.winner] : null;

  if (stage.type === "envelope" && w) {
    $("env-badge").textContent = `Award ${stage.winner + 1} of ${WINNERS.length}`;
    $("env-line").textContent = "And the recognition goes to…";
  }

  if (stage.type === "reveal" && w) {
    $("reveal-name").textContent = w.name;
    $("reveal-values").innerHTML = w.values
      .map((v) => `<span class="win-value">${escapeHtml(v)}</span>`).join("");
  }

  if (stage.type === "laudatio" && w) {
    $("laud-body").textContent = w.laudatio;
    $("laud-name").textContent = `— for ${w.name}`;
    $("laud-kicker").textContent = w.kicker || "";
  }

  // ── host speech bubbles: reroll only when the stage is freshly entered ──
  if (isNew) {
    const bubbleFor = {
      open: ["bubble-open", HOST_LINES.open],
      values: ["bubble-values", HOST_LINES.values],
      envelope: ["bubble-env", HOST_LINES.envelope],
      reveal: ["bubble-reveal", HOST_LINES.reveal],
      donation: ["bubble-don", HOST_LINES.donation],
      close: ["bubble-close", HOST_LINES.close],
    }[stage.type];
    if (bubbleFor) {
      const el = $(bubbleFor[0]);
      if (el) el.textContent = pickLine(bubbleFor[1]);
    }
  }

  // ── one-shot effects on entering a stage ──
  if (isNew) {
    if (stage.type === "reveal") {
      confetti.burst(4000);
      if (sound.isOn()) sound.reveal();
    } else {
      confetti.stop();
      if (sound.isOn()) {
        if (stage.type === "envelope") sound.suspense();
        else if (stage.type === "donation") sound.warm();
        else if (stage.type === "close") sound.close();
        else sound.step();
      }
    }
  }
}

chan.on((msg) => { if (msg.type === "state") render(msg.state); });

// sound toggle (needed once because browsers block autoplay)
const sb = $("sound-toggle");
sb.addEventListener("click", () => {
  if (sound.isOn()) {
    sound.disable(); sb.textContent = "🔇 Enable sound"; sb.classList.remove("on");
  } else {
    sound.enable(); sb.textContent = "🔊 Sound on"; sb.classList.add("on");
    sound.step();
  }
});

// ask the control window for the current state
chan.post({ type: "request" });
