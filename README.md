# VolleyRo

Solo volleyball rotation, substitution, and rally tracker built as a lightweight single-page app.

## Features
- Interactive court map with serve/receive layouts for each 5-1 rotation (S, OPP, MB, OH1, L, OH2), matching diagrammed lanes.
- Manual rotation, serve/receive toggle, and scoreboard with quick session reset.
- Substitutions between on-court slots and bench players with instant lineup refresh.
- Rally tracker with win/loss logging, score updates, collapsible recent log, and rotation awareness in the log.
- Calm, readable palette using: #f5f6f8 (bg), #eef0f3 (panel), #e3e7ed (surface), #6ba3c4 (accent), #b7d6e8 (accent-2), #d9e2ec/#cfd6df (court), #9aa8ba (lines), #5a6472 (muted), #e0a0a6 (loss).

## Tech Stack
- HTML + CSS + vanilla JavaScript.
- No build tooling or dependencies required.

## Getting Started
1. Clone or download the project folder.
2. Open `index.html` in your browser.
3. That is it. All assets are local.

## Usage
- Court: Tap a player card on the court to select them, then use the substitution controls to swap with a bench player.
- Serve/receive layouts: Rotation index updates when you rotate; serve/receive positions update to the matching diagrammed pattern. Libero tracks the back-row middle/defense spots.
- Serve/receive toggle: Use the header toggle or the court controls to switch phases; manual rotate is available for side-outs.
- Rally tracking: Press win/loss buttons to update scores; when you win in receive the lineup auto-rotates and you gain serve.
- Log toggle: Use "Show/Hide log" to expand or collapse the recent rally list; the summary line always shows the latest outcome.
- Reset: "Reset session" clears scores, history, and returns to the default lineup in receive (Rotation 1).

## Customization Ideas
- Edit `defaultLineup` and `defaultBench` in `app.js` to rename players, or adjust L vs. MB usage if you want a true M2 instead of libero coverage.
- Adjust colors in `styles.css` by editing the CSS variables in the `:root` block.

## Notes
- No persistence is built in; each browser session starts clean.
- Tested on modern evergreen browsers; no additional setup required.
