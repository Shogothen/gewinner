// ── shared.js — data model + sync channel for the Award Show ──────────────
// Everything you might want to edit lives at the top of this file.

// ── The winners ───────────────────────────────────────────────────────────
// laudatio: spoken-word tribute shown on screen. Keep it 2–4 short sentences.
// values:   one or more company values this person is recognised for.
export const WINNERS = [
  {
    name: "Madalina Lucaci",
    values: ["Customer Focus"],
    laudatio:
      "Whenever a customer question lands, Madalina is already halfway to the answer. " +
      "She listens first, follows through without being asked, and leaves people " +
      "feeling genuinely looked after. That is Customer Focus in practice.",
    // optional: short quote or closing line under the laudatio
    kicker: "",
  },
  {
    name: "Marco Cella",
    values: ["Ownership & Empowerment", "Continuous Improvement"],
    laudatio:
      "Marco takes hold of problems no one assigned to him and quietly makes them " +
      "someone's win — usually the team's. He leaves every process a little better " +
      "than he found it, and he brings others along while doing it.",
    kicker: "",
  },
];

// ── Donation segment ──────────────────────────────────────────────────────
export const DONATION = {
  amount: "€500",
  headline: "Your prize, your cause",
  body:
    "Each winner donates €500 to a charitable organisation of their choice — " +
    "recognition that reaches beyond this room.",
  note: "Tell us your organisation and we'll take care of the rest.",
};

// ── Opening / closing copy ────────────────────────────────────────────────
export const COPY = {
  openKicker: "Employee Recognition",
  openTitle: "Recognising the people\nbehind our values",
  openSub: "Two colleagues. Chosen by their peers. Let's begin.",
  valuesKicker: "Our values in action",
  closeKicker: "Thank you",
  closeTitle: "Congratulations",
  closeSub: "To our winners — and to everyone who nominated them.",
};

// ── Host one-liners (warm, not sarcastic — this is a tribute, not a quiz) ─
export const HOST_LINES = {
  open: [
    "Two people. A lot of quiet good work. Let's begin.",
    "This is the part of the year I actually look forward to.",
    "Nominated by colleagues. That's the highest bar there is.",
  ],
  values: [
    "Values only count when someone lives them.",
    "Three values. Two people who made them real.",
  ],
  envelope: [
    "No drumroll. Just deserved.",
    "You already know. Say it anyway.",
    "Here we go.",
  ],
  reveal: [
    "Very well deserved.",
    "Nobody's surprised. Everyone's pleased.",
    "Take the applause. You earned it.",
  ],
  donation: [
    "Recognition that leaves the building.",
    "Pick a cause. We'll handle the rest.",
  ],
  close: [
    "Same time next year. Bar's higher now.",
    "Thank you — all of you.",
  ],
};

// ── Company values (used on the values screen) ────────────────────────────
export const VALUES = [
  { name: "Customer Focus", blurb: "We start with the customer and work backwards." },
  { name: "Ownership & Empowerment", blurb: "We take responsibility and trust each other to act." },
  { name: "Continuous Improvement", blurb: "We leave things better than we found them." },
];

// ── Stage sequence ────────────────────────────────────────────────────────
// The whole show is a linear list of stages. Next/Prev walks through it.
export function buildStages() {
  const stages = [{ type: "open" }, { type: "values" }];
  WINNERS.forEach((w, i) => {
    stages.push({ type: "envelope", winner: i }); // "and the award goes to…"
    stages.push({ type: "reveal", winner: i });   // name + values, confetti
    stages.push({ type: "laudatio", winner: i }); // tribute text
  });
  stages.push({ type: "donation" });
  stages.push({ type: "close" });
  return stages;
}

export const STAGE_LABELS = {
  open: "Opening",
  values: "Values",
  envelope: "Envelope",
  reveal: "Winner reveal",
  laudatio: "Laudatio",
  donation: "Donation",
  close: "Closing",
};

// ── sync channel (same approach as the quiz) ──────────────────────────────
const CHANNEL = "cx-awards";

export function makeChannel() {
  const bc = new BroadcastChannel(CHANNEL);
  return {
    post(msg) { bc.postMessage(msg); },
    on(fn) { bc.onmessage = (e) => fn(e.data); },
  };
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
