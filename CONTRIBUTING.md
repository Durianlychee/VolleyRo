# Contributing to VolleyRo

Thanks for helping out. VolleyRo is a small vanilla HTML/CSS/JS app, and we want to keep it that way.

## Run it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static server works.

## Run the tests

```sh
node --test
```

Needs Node 22 or newer. Please add or update tests for behaviour changes.

## Ground rules

- **Zero dependencies and no build step.** No `package.json`, bundlers or frameworks.
- Keep `index.html`, `app.js` and `styles.css` at the repository root (GitHub Pages serves from `main` at `/`).
- Follow FIVB rules, since that is the rulebook the app teaches.
- If you change a cached shell file, bump `CACHE_VERSION` in `sw.js`.
- **One change per pull request**, with a short description of what and why.
