# VolleyRo

Solo volleyball rotation, substitution, and rally tracker built as a lightweight single-page app.

## Features
- Interactive court map with serve/receive layouts for each 5-1 rotation (S1, OH1, M1, OPP, OH2, M2), matching diagrammed lanes.
- Manual rotation, serve/receive toggle, and scoreboard with a session reset that asks for confirmation.
- Players are named by role (Setter, Outside 1, Middle 1, Opposite, Outside 2, Middle 2 for the starters; Opposite 2, Outside 3, Middle 3, Middle 4, Outside 4 for the bench), so each court token shows its role at a glance, even after a substitution, and no real names are used.
- Optional "With libero" switch, off by default so a first lesson stays on the bare 5-1 (two middles, no libero). When it is on, a contrasting amber Libero token (role `L`) replaces whichever middle blocker is in the back row, in that middle's spot, and a note under the court label spells out the swap. The middle leaves when rotating to the back row and returns on reaching the front row, and under FIVB the libero never serves: a middle who reaches position 1 stays in to serve, and the libero comes back in for them after the serve.
- Substitutions between on-court slots and bench players with instant lineup refresh.
- Rally tracker with win/loss logging, score updates, undo of the last rally, collapsible recent log, and rotation awareness in the log.
- FIVB set end: a set is won at 25 points with a two-point lead (15 in the fifth set), then a prompt starts the next set. Only the current set number is tracked; there is no match score.
- Serving indicator in serve phase. Front-row players are filled tokens and back-row players outlined tokens; the token colour, court border and phase pill follow the phase (blue = serve, warm clay = receive). The libero token is amber (`--libero-surface`), the contrasting jersey FIVB requires.
- Volleyball-court icon (`favicon.svg`, PNG fallbacks and `manifest.webmanifest`).
- Calm, readable palette using: #f5f6f8 (bg), #eef0f3 (panel), #e3e7ed (surface), #6ba3c4 (accent), #b7d6e8 (accent-2), #d9e2ec/#cfd6df (court), #9aa8ba (lines), #5a6472 (muted), #e0a0a6 (loss), plus #336b8f (accent ink: status text, serve phase tokens), #9c5a2a (receive phase tokens) and #a8434f (loss ink: error text) where text or cues need WCAG AA contrast.

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
- With libero on: the libero stands in the replaced middle's spot, so every formation and the overlap check are unchanged, and rotation, serving order and rotation labels stay the same as with it off. The Rotate clockwise status line (and a side-out win) says when the libero comes in or out. Tapping the libero selects the middle they replaced, so the substitution controls still act on the six rotating players; the on-court dropdown marks that slot "(libero in)". The switch is a lesson setting: it is not undone by Undo and survives Reset and new sets. Libero replacement limits, a second libero and other rulebooks are not modelled.
- Receive formations follow the conventional 5-1 pattern in every rotation: the two outside hitters and the back-row middle pass, while the setter and the opposite stay out of the passing line. Every receive formation is legal under the FIVB overlap rule (7.4.3).
- Serve/receive toggle: Use the header toggle or the court controls to switch phases; manual rotate is available for side-outs.
- Rally tracking: Press win/loss buttons to update scores; when you win in receive the lineup auto-rotates and you gain serve. On a phone these buttons sit in a bar pinned to the bottom of the screen.
- Set end: when a team reaches 25 with a two-point lead (15 in Set 5), the rally buttons give way to "Set N won by ..." and a "Start set N+1" button. Starting the next set clears the score and log, puts the players back in their Rotation 1 positions (substitutes stay on), and, for Sets 2 to 4, gives first serve to the team that received first in the set just played. Set 5 and a new match keep the current serve/receive phase, because a coin toss decides first serve there: the status line says so, and you switch with the serve/receive toggle. After Set 5 the button reads "Start new match" and goes back to Set 1.
- Undo: "Undo last rally" restores the score, set, lineup, rotation and serve/receive phase from just before the most recent logged rally (a substitution made after that rally is undone too). Undoing a mis-tapped winning point reopens the set; undoing just after starting a new set returns to the end of the previous one. Press it again to step further back.
- Log toggle: Use "Show/Hide log" to expand or collapse the recent rally list; the summary line always shows the latest outcome.
- Reset: "Reset session" asks for confirmation, then clears scores, history and undo, and returns to Set 1 with the default lineup in receive (Rotation 1).

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
