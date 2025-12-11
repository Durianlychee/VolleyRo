# VolleyRo

Solo volleyball rotation, substitution, and rally tracker built as a lightweight single-page app.

## Features
- Interactive court map with role markers (S, OH1, OH2, OPP, MB, L) and serve/receive layouts.
- Manual rotation, serve/receive toggle, and scoreboard with quick session reset.
- Substitutions between on-court slots and bench players with instant lineup refresh.
- Rally tracker with win/loss logging, score updates, and a collapsible recent log.
- Clean Dark Sunshine Indigo palette using: #584567 (base), #906F77 (panel), #75ABC3 (cool accent), #FFDF37 (sunshine accent), #F9FDF2 (text/lines), #B0B8D3 (muted), #F6130F (loss state).

## Tech Stack
- HTML + CSS + vanilla JavaScript.
- No build tooling or dependencies required.

## Getting Started
1. Clone or download the project folder.
2. Open `index.html` in your browser.
3. That is it. All assets are local.

## Usage
- Court: Tap a player card on the court to select them, then use the substitution controls to swap with a bench player.
- Serve/receive: Use the header toggle or the court controls to switch phases; manual rotate is available for side-outs.
- Rally tracking: Press win/loss buttons to update scores; when you win in receive the lineup auto-rotates and you gain serve.
- Log toggle: Use "Show/Hide log" to expand or collapse the recent rally list; the summary line always shows the latest outcome.
- Reset: "Reset session" clears scores, history, and returns to the default lineup in receive.

## Customization Ideas
- Edit `defaultLineup` and `defaultBench` in `app.js` to rename players and roles.
- Adjust colors in `styles.css` by editing the CSS variables in the `:root` block.

## Notes
- No persistence is built in; each browser session starts clean.
- Tested on modern evergreen browsers; no additional setup required.
