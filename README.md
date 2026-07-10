# Gym Tracker

A tiny installable web app for logging your Pull/Push/Leg workouts and body
weight without retyping exercise names every time. No build step, no
backend, no account — plain HTML/CSS/JS, data stored in the phone's browser.

Your existing log (Jan–Jul) is pre-loaded as seed data, so history and trends
are there from the first launch.

## How it works

- Home screen shows Pull / Push / Leg / Body weight, each with "last logged"
  info.
- Tapping a routine opens a log screen where every exercise has 4 set boxes
  (weight + reps each), **pre-filled from what you logged last time** — you
  only edit the numbers that changed, then tap Save. Extra boxes and an
  optional note field are there for the days you do more sets or want to jot
  something down.
- Logging again on the same day updates that day's entry instead of creating
  a duplicate.
- Add an exercise inline any time; it's remembered in that routine going
  forward.
- History screens list every past session per routine.
- Body weight screen shows a trend line plus full history.
- Settings has a one-tap JSON export/import for backups (data lives only on
  this device's browser storage — export occasionally, especially before
  clearing browser data or switching phones).

## Using it on your phone

This is a static site — any static host works. Easiest with this repo:

1. On GitHub: **Settings → Pages** → set source to `main` and folder `/`
   (root).
2. GitHub gives you a URL like `https://mahi155.github.io/gym-tracker/`.
3. Open that URL in your phone's browser.
4. **iOS (Safari):** Share → "Add to Home Screen".
   **Android (Chrome):** menu → "Add to Home screen" / "Install app".
5. It now opens full-screen like a normal app icon, and works offline after
   the first load.

No GitHub Pages? Any static host (Netlify, Vercel, Cloudflare Pages) works
the same way — just point it at this repo's root.

## Local development

```bash
python3 -m http.server 8000
# open http://localhost:8000 on your computer to test in a browser
```

## Files

```
index.html      # app shell
style.css       # dark, mobile-first styles
app.js          # all logic (routing, storage, rendering)
seed-data.js    # your existing workout log, used only on first run
manifest.json   # PWA metadata (name, icons, colors)
sw.js           # offline caching
icons/          # app icons
```
