# VolleyRo

Solo volleyball rotation, substitution, and rally tracker built as a lightweight single-page app.

## Features
- Interactive court map with serve/receive layouts for each 5-1 rotation (S1, OH1, M1, OPP, OH2, M2), matching diagrammed lanes.
- Manual rotation, serve/receive toggle, and scoreboard with a session reset that asks for confirmation.
- Players are named by role (Setter, Outside 1, Middle 1, Opposite, Outside 2, Middle 2 on court; Bench Opposite, Bench Outside 1 and so on for the bench), so each court token shows its role at a glance and no real names are used.
- Substitutions between on-court slots and bench players with instant lineup refresh.
- Rally tracker with win/loss logging, score updates, undo of the last rally, collapsible recent log, and rotation awareness in the log.
- Serving indicator in serve phase and front-row vs back-row color cues on the court.
- Calm, readable palette using: #f5f6f8 (bg), #eef0f3 (panel), #e3e7ed (surface), #6ba3c4 (accent), #b7d6e8 (accent-2), #d9e2ec/#cfd6df (court), #9aa8ba (lines), #5a6472 (muted), #e0a0a6 (loss), plus #336b8f (accent ink: status text, front-row cards, serve phase) and #a8434f (loss ink: error text) where text or cues need WCAG AA contrast.

## Tech Stack
- HTML + CSS + vanilla JavaScript.
- No build tooling or dependencies required.

## Getting Started
1. Clone or download the project folder.
2. Open `index.html` in your browser.
3. That is it. All assets are local.

## Usage
- Court: Tap a player card on the court to select them, then use the substitution controls to swap with a bench player.
- Serve/receive layouts: The label above the court names each rotation by play order and by where the setter stands, for example "Rot 2 · Setter in 6" (the setter moves 1, 6, 5, 4, 3, 2 as you play Rot 1 to 6; with no setter on court only the play order shows). It updates when you rotate, and the rally log, phase hint and undo message use the same naming; serve/receive positions update to the matching diagrammed pattern.
- Serve/receive toggle: Use the header toggle or the court controls to switch phases; manual rotate is available for side-outs.
- Rally tracking: Press win/loss buttons to update scores; when you win in receive the lineup auto-rotates and you gain serve. On a phone these buttons sit in a bar pinned to the bottom of the screen.
- Undo: "Undo last rally" restores the score, lineup, rotation and serve/receive phase from just before the most recent logged rally (a substitution made after that rally is undone too). Press it again to step further back.
- Log toggle: Use "Show/Hide log" to expand or collapse the recent rally list; the summary line always shows the latest outcome.
- Reset: "Reset session" asks for confirmation, then clears scores, history and undo, and returns to the default lineup in receive (Rotation 1).

## Customization Ideas
- Edit `defaultLineup` and `defaultBench` in `app.js` to change player labels (`defaultLineup` is listed in rotational-position order for Rotation 1: position 1, the server, first).
- Adjust colors in `styles.css` by editing the CSS variables in the `:root` block.

## Tests
- Run `node --test` from the project folder (Node 22 or newer). The tests load the real `app.js` against a small fake DOM in `test/harness.js`; there are no dependencies to install.
- GitHub Actions runs the same command on every push and pull request.

## Notes
- No persistence is built in; each browser session starts clean.
- Tested on modern evergreen browsers; no additional setup required.

## Licence
Released under the MIT License; see [LICENSE](LICENSE).
