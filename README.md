# Quatréa — The Year, Distilled

A scrollytelling website concept for **Quatréa**, a fictional maison de parfum with four fragrances, one for each season.

**Live demo:** https://izainpasha.github.io/quatrea/

| N° | Fragrance | Season | Mood |
|----|-----------|--------|------|
| 01 | Rosée | Spring | Dewy, green, tender |
| 02 | Solstice | Summer | Citrus, salt, solar |
| 03 | Ambre Roux | Autumn | Spice, smoke, amber |
| 04 | Givre | Winter | Frost, iris, incense |

## Experience

- **Persistent WebGL stage.** One Three.js canvas stays mounted across every route, so the four glass flacons are never reloaded. They glide between layouts as you scroll and as you change pages.
  - **Bottles:** real-time refractive glass with a liquid fill level, engraved labels, and a cap sculpted for each season.
  - **Background:** a domain-warped "silk" shader whose palette shifts with each season.
  - **Particles:** one GPU system per season: petals, sun motes, falling leaves and snow.
- **Scrollytelling** with GSAP ScrollTrigger and Lenis smooth scroll:
  - Home: a manifesto whose words light up as you read, then four pinned season chapters.
  - Collection: a horizontal journey through the year where each bottle travels with its panel.
  - Fragrance pages: a "notes pyramid" where the bottle evaporates as top notes give way to the heart and base.
  - Atelier: a four-step process where the flacon fills as you scroll.
- **Pages:** Home, Collection, Fragrance (×4), Atelier, Scent Finder.
- **Transitions:** a four-column curtain in the seasonal colours, a preloader, SplitText reveals, a custom cursor, magnetic buttons, and a marquee driven by scroll velocity.
- **Interactive features:**
  - Scent Finder: a quiz where the WebGL scene reacts live to every answer.
  - A working bag drawer, saved in `localStorage`.

## Performance

Rendering adapts to the visitor's hardware, so the page never takes over the machine:

- **GPU tier detection at startup.**
  - Integrated and mobile GPUs (Intel Iris/UHD, Mali, Adreno and similar) start at a lighter quality level.
  - Software renderers get a CSS fallback with no WebGL.
- **Live frame-rate monitor.** If frames slow down, it lowers resolution, then the glass refraction quality, and finally switches to non-refractive glass.
- **Rendering is driven by the same GSAP ticker as Lenis**, so WebGL and the DOM update in the same frame. When the visitor is idle, it is capped at 30 fps.
- **The silk background is rendered offscreen at about a quarter of the screen resolution** and then upscaled.

To force a level for testing, use `?quality=high | low | off` or `?quality=0`–`3`.

## Stack

React 19 · React Router 7 · Three.js + @react-three/fiber + drei · GSAP 3 (ScrollTrigger, SplitText) · Lenis · Vite

## Develop

```bash
npm install
npm run dev       # http://localhost:5173/quatrea/
npm run build     # outputs dist/ (+ 404.html for SPA deep links on GitHub Pages)
```

Each push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

---

*Quatréa is a fictional brand created as a design concept. All names, copy and products are invented.*
