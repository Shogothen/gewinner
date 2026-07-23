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

## The running order (12 stages)
1. Opening
2. Our values
3. Envelope — award 1
4. **Reveal — Madalina Lucaci** (confetti)
5. Laudatio — Madalina (the nomination)
6. What stood out — Madalina
7. Envelope — award 2
8. **Reveal — Marco Cella** (confetti)
9. Laudatio — Marco (the nomination)
10. What stood out — Marco
11. Donation (€500 per winner)
12. Closing

## Editing the content
Everything you'd want to change is at the top of `assets/shared.js`:
- `WINNERS` — names, values, `laudatio` (the nomination) and `standout` (the one line)
- `DONATION` — amount and wording of the donation slide
- `COPY` — opening and closing copy
- `VALUES` — the three value cards

The laudatio texts are the real nominations, split across two screens so they stay
readable on a projector: the full nomination first, then the line that stood out.

## Deploying (optional)
Upload the contents of this folder to a GitHub Pages repo (files at the root,
not inside a subfolder). `.nojekyll` is included.
