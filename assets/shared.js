// ── shared.js — data model + sync channel for the Award Show ──────────────
// Everything you might want to edit lives at the top of this file.

// ── The winners ───────────────────────────────────────────────────────────
// laudatio: spoken-word tribute shown on screen. Keep it 2–4 short sentences.
// values:   one or more company values this person is recognised for.
export const WINNERS = [
  {
    name: "Madalina Lucaci",
    values: ["Customer Focus"],
    // Part 1: what the nomination said
    laudatio:
      "Nominated for her strong customer focus, attention to detail and consistency " +
      "in Support — understanding customer issues, helping customers and colleagues " +
      "with the right material, and giving Product the feedback that improves our service.",
    // Part 2: the line that stood out
    standout:
      "She does not stop until the customer need is properly addressed.",
  },
  {
    name: "Marco Cella",
    values: ["Ownership & Empowerment", "Continuous Improvement"],
    laudatio:
      "Two nominations, two values. Recognised for strong ownership in cloud and " +
      "infrastructure — expert support on critical issues, unblocking teams, keeping " +
      "the platform stable. And for the IngressController migration: coordinating teams, " +
      "planning the production update, moving from Nginx to HAProxy without downtime.",
    standout:
      "Technical expertise, reliability, and a commitment to infrastructure that " +
      "supports application teams and protects Cofinity-X.",
  },
];

// ── Kicktipp (World Cup prediction game) ─────────────────────────────────
export const KICKTIPP = {
  kicker: "Kicktipp · World Cup",
  title: "Our prediction champions",
  sub: "A whole tournament of confident guesses. Here's who guessed best.",
  podium: [
    { place: 2, name: "Joshua" },
    { place: 1, name: "Francisca" },
    { place: 3, name: "Niklas" },
  ],
};

// ── Donation segment ──────────────────────────────────────────────────────
export const DONATION = {
  amount: "€500",
  headline: "Your prize, your cause",
  body: "Each winner directs €500 to a cause they care about.",
  note: "Recognition that reaches beyond this room.",
  // who gives to whom
  causes: [
    {
      winner: "Madalina Lucaci",
      org: "Hundehilfe NRW e.V.",
      logo: "assets/logos/hundehilfe.png",
      blurb: "Rescue and rehoming for dogs in need across NRW.",
    },
    {
      winner: "Marco Cella",
      org: "Médecins Sans Frontières",
      logo: "assets/logos/msf.svg",
      blurb: "Medical aid where it's needed most, wherever that is.",
    },
  ],
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

// ── Host one-liners — the host only appears on the opening and the envelope ─
export const HOST_LINES = {
  open: [
    "Two people. A lot of quiet good work. Let's begin.",
    "This is the part of the year I actually look forward to.",
    "Nominated by colleagues. That's the highest bar there is.",
  ],
  envelope: [
    "No drumroll. Just deserved.",
    "You already know. Say it anyway.",
    "Here we go.",
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
  const stages = [{ type: "kicktipp" }, { type: "open" }, { type: "values" }];
  WINNERS.forEach((w, i) => {
    stages.push({ type: "envelope", winner: i }); // "and the award goes to…"
    stages.push({ type: "reveal", winner: i });   // name + values, confetti
    stages.push({ type: "laudatio", winner: i }); // what the nomination said
    stages.push({ type: "standout", winner: i }); // the line that stood out
  });
  stages.push({ type: "donation" });
  stages.push({ type: "close" });
  return stages;
}

export const STAGE_LABELS = {
  kicktipp: "Kicktipp",
  open: "Opening",
  values: "Values",
  envelope: "Envelope",
  reveal: "Winner reveal",
  laudatio: "Laudatio",
  standout: "What stood out",
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
