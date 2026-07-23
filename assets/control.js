// ── control.js — moderator surface: walks through the show ────────────────
import { WINNERS, STAGE_LABELS, buildStages, makeChannel, escapeHtml } from "./shared.js";

const $ = (id) => document.getElementById(id);
const chan = makeChannel();
const stages = buildStages();
let index = 0;

// ── what each stage says in the control panel ────────────────────────────
function describe(st) {
  const w = st.winner != null ? WINNERS[st.winner] : null;
  switch (st.type) {
    case "open":     return { title: "Opening", detail: "Welcome slide. Set the tone, then press Next." };
    case "values":   return { title: "Our values", detail: "The three values appear as cards. Brief framing here." };
    case "envelope": return { title: `Envelope — award ${st.winner + 1}`,
                              detail: "Suspense slide. Hold it a beat before revealing." };
    case "reveal":   return { title: `Reveal — ${w.name}`,
                              detail: `Name + values appear, confetti fires. Values: ${w.values.join(" · ")}` };
    case "laudatio": return { title: `Laudatio — ${w.name}`,
                              detail: "The nomination in full. Read it aloud while it's on screen." };
    case "standout": return { title: `What stood out — ${w.name}`,
                              detail: "The one line that summed it up. Let it land, then move on." };
    case "donation": return { title: "Donation — €500 each",
                              detail: "Madalina → Hundehilfe NRW · Marco → Médecins Sans Frontières" };
    case "close":    return { title: "Closing", detail: "Final thank-you slide with both names." };
    default:         return { title: "—", detail: "" };
  }
}

function shortLabel(st) {
  const w = st.winner != null ? WINNERS[st.winner] : null;
  const base = STAGE_LABELS[st.type] || st.type;
  return { base, who: w ? w.name.split(" ")[0] : "" };
}

function renderSteps() {
  $("steps").innerHTML = stages.map((st, i) => {
    const { base, who } = shortLabel(st);
    return `<button class="step ${i === index ? "on" : ""}" data-i="${i}">
      <span class="n">${i + 1}</span><span>${escapeHtml(base)}</span>
      <span class="who">${escapeHtml(who)}</span></button>`;
  }).join("");
}

function render() {
  const st = stages[index];
  const d = describe(st);
  $("count").textContent = `${index + 1} / ${stages.length}`;
  $("now-title").textContent = d.title;
  $("now-detail").textContent = d.detail;

  const nx = stages[index + 1];
  $("next-text").textContent = nx ? describe(nx).title : "— end of show —";

  $("prev").disabled = index === 0;
  $("prev").style.opacity = index === 0 ? "0.4" : "1";
  $("next").disabled = index === stages.length - 1;
  $("next").style.opacity = index === stages.length - 1 ? "0.4" : "1";

  renderSteps();
  broadcast();
}

function broadcast() {
  chan.post({
    type: "state",
    state: { stage: stages[index], index, total: stages.length },
  });
}

function go(i) {
  index = Math.max(0, Math.min(i, stages.length - 1));
  render();
}

// ── events ───────────────────────────────────────────────────────────────
$("next").addEventListener("click", () => go(index + 1));
$("prev").addEventListener("click", () => go(index - 1));
$("steps").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]");
  if (b) go(+b.dataset.i);
});
$("open-beamer").addEventListener("click", () => {
  window.open("beamer.html", "cx-award-beamer", "width=1280,height=720");
});

document.addEventListener("keydown", (e) => {
  const typing = /input|textarea/i.test(document.activeElement.tagName);
  if (typing) return;
  if (e.code === "ArrowRight" || e.code === "Space") { e.preventDefault(); go(index + 1); }
  if (e.code === "ArrowLeft") { e.preventDefault(); go(index - 1); }
});

// answer the beamer's request for current state
chan.on((msg) => { if (msg.type === "request") broadcast(); });

// ── init ─────────────────────────────────────────────────────────────────
render();
