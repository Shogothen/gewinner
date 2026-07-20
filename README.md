# Cofinity-X — Employee Recognition Award Show

A live-controlled, beamer-ready announcement for the Employee Recognition winners.
Same visual language as the Pub Quiz tool. No build step, no dependencies.

## Run it
1. Open `index.html` (the control surface) in a browser.
2. Click **Open beamer window ↗**, drag that window to the projector, press **F11**.
3. On the beamer, click **Enable sound** once (top right) so the room hears the cues.
4. Walk the show with **Next / →  / Space**. Jump to any stage from the list.

Control and beamer must run in the same browser on the same computer — they sync
via BroadcastChannel.

## The running order (10 stages)
1. Opening
2. Our values
3. Envelope — award 1
4. **Reveal — Madalina Lucaci** (confetti)
5. Laudatio — Madalina
6. Envelope — award 2
7. **Reveal — Marco Cella** (confetti)
8. Laudatio — Marco
9. Donation (€500 per winner)
10. Closing

## Editing the content
Everything you'd want to change is at the top of `assets/shared.js`:
- `WINNERS` — names, values, **laudatio text**, optional kicker line
- `DONATION` — amount and wording of the donation slide
- `COPY` — opening and closing copy
- `VALUES` — the three value cards

**The laudatio texts are placeholders.** Replace them with something specific and
true about each person — a concrete moment beats a generic compliment every time.

## Deploying (optional)
Upload the contents of this folder to a GitHub Pages repo (files at the root,
not inside a subfolder). `.nojekyll` is included.
