# Project Memory — Dee (Dmitry)

## Who is Dee
- Full stack developer + creative — web apps, games, motion/animation, music videos
- Expert AI tools user — integrates AI into creative and dev workflow
- Based in Thailand ("Dee" means "Good" in Thai)
- GitHub: `lnaul` / naumovdimitriy@gmail.com
- Uses VS Code
- Prefers short confirmations: "run", "y", "commit"

---

## Active Project: Portfolio v2 (NEW — not started yet)
> Start in a **new folder**, fresh repo, separate from existing portfolio

### Concept
Single page portfolio. Each section demonstrates a different skill. The PAGE ITSELF is the proof — how it's built shows what Dee can do. Speaks to both developers and creative clients.

### Stack (locked — no exceptions)
| Layer | Tool |
|---|---|
| Framework | React + Vite |
| 3D | Three.js (R3F) |
| Smooth scroll | Lenis |
| Animation | Framer Motion |
| Code editor | Monaco Editor (Web & Build section only) |
| Contact form | EmailJS or Formspree |
| Videos | Pre-rendered, stored in `/public` |
| Deploy | Vercel |
| Version control | GitHub |
> **NO backend. NO GSAP. NO Render.**

### Page Sections (locked)
1. **Hero**
2. **AI & Craft**
3. **Web & Build**
4. **Code & Play**
5. **Contact**

### The 3D Thread
One 3D object travels through ALL sections. On each scroll transition it transforms into a new shape related to that section. Camera choreography inspired by lusion.co.
- **Leading candidate**: Sphere (universal, pure potential, morphs well)
- Particles orbit the object in Hero
- On scroll: particles absorb INTO object as it transforms
- Object shape TBD per section — to be decided before build starts

### Hero Section (locked)
**Text layout:**
```
Built to move.

Web apps, games, and creative experiences — powered by AI, driven by craft.

[ 3D object ]

Creator. Developer. Human.
```
**Environment:** Dark void, 3D object center, particle field orbiting it. On scroll particles get sucked into object as it transforms. Feels like infinite space, pure potential.

### AI & Craft Section (in progress — text TBD)
**Interaction:** Button on screen triggers fake AI video generation:
- 2-3 second fake loading animation
- Plays random video from pre-made pool of 5-10 videos
- Each button press plays a different one
- Videos pre-rendered using Midjourney/RunwayML/Sora — stored in `/public/videos/`
- User thinks it's generating live — it's an illusion

### Web & Build Section (text TBD)
**Interaction:** Live Monaco Editor embedded — user edits code and sees result in real time.

### Code & Play Section (text TBD)
**Interaction:** Fully playable mini game built in Three.js or vanilla canvas, embedded directly in the page.

### Contact Section (text TBD)
Simple, memorable close. EmailJS or Formspree for form — no backend needed.

### Design Aesthetic (TBD — not decided yet)
- Dark background confirmed
- Mood: modern, futuristic, personal
- Each section has different visual mood but one thread connects them

---

## Existing Project: Portfolio v1
- **Repo**: https://github.com/lnaul/portfolio-frontend
- **Live**: https://portfolio-frontend-one-omega.vercel.app
- **Local**: `cd Portfolio/portfolio-frontend && npm run dev` → http://localhost:3000
- **Stack**: React + Vite, Vercel
- **Routes**:
  - `/` → PageThree.jsx — 4-slide full-page scroll showcase
  - `/lamai` → Lamai cyberpunk inhaler showcase (Three.js + GSAP)
- **Key files**:
  - `src/pages/PageThree.jsx` + `PageThree.css`
  - `src/pages/LamaiPage.jsx` + `LamaiPage.css`
  - `src/pages/LamaiScene.jsx` — Three.js scene (NO bloom — breaks render)

### Lamai Page
- Route: `/lamai`
- Cyberpunk inhaler product: neon blue `#00f0ff` + orange `#ff6a00`, bg `#050510`
- 3D placeholder inhaler (Three.js primitives) — swap with `.glb` when real model ready
- 5 scroll sections, two-column layout, model always opposite text
- Model transforms per section: position, scale, tilt

---

## Active Project: BOLT.io — Electric Storm
- **Genre**: Isometric hyper-casual growing game (Tasty Planet + Crossy Road style)
- **Visual**: Isometric 2.5D pixel art, cyberpunk palette
- **Platform**: HTML5 → Mobile (iOS/Android), portrait
- **Mechanic**: Grow electric spark by absorbing objects, chain lightning combos
- **Repo**: https://github.com/lnaul/bolt.git
- **Local**: `cd bolt && python3 -m http.server 8080` → http://localhost:8080
- **Last commit**: `47dd4b3` — tap-to-move mobile controls
- **Next**: Buildings with 3D height, then chain lightning effect
- **Auth**: PAT in remote URL — if push fails: `git remote set-url origin https://NEW_TOKEN@github.com/lnaul/bolt.git`