# ARIA Cybersecurity Academy

SecureAuth dissertation demo — **Developer path** vertical slice (1-day MVP).

## Run

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # production bundle (base: './' for /academy/ embed)
npm run preview # serve dist
```

### Embed into SecureAuth

SecureAuth serves the Academy at **`/academy/`** from `phase3-frontend/academy/`.

After changing ARIA source:

```bash
npm run build
# from repo root (parent of ARIA/):
# copy ARIA/dist/* → phase3-frontend/academy/
```

Then restart the SecureAuth server and open **Cybersecurity Bootcamp** on the landing page (or `http://localhost:3000/academy/`).

Standalone Vite (`npm run dev`) does not need that copy step.

## What ships in this build

1. **OrbField** — 3D/4D parallax orb background (depth layers, organic motion, mouse parallax, gold celebrate burst)
2. **Role select** — four glass cards; only **Developer** is interactive; others are “Coming soon”
3. **Dashboard** — rank, XP bar, progress ring, streak, recommended lesson, badges, daily-challenge stub
4. **Five Developer lessons** — MentorScript intro → concepts → practical → XP unlock
5. **Gamification** — ranks, XP rules, badges, rank-up / badge celebration

## Architecture

```
src/
  core/           AriaEngine, MentorScript, ProgressStore
  visuals/        OrbField, Glass.css, transitions
  paths/          developer (+ student/lecturer/admin Coming soon)
  components/     RoleSelect, Dashboard, LessonCard, XPBar, BadgeGrid, AriaAvatar
  gamification/   xpRules, ranks
```

**AI seam:** `getAriaResponse(context) -> string` in `MentorScript.js` — static today, LLM-swappable later without touching callers.

Progress is stored in `localStorage` (`aria_progress_v1`). Use **Reset demo** on the dashboard to clear.

## Out of scope (roadmap, not this sprint)

Full Student/Lecturer/Admin paths, leaderboard, live LLM, voice, certificates, classroom admin.
