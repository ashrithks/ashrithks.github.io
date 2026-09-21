# Ashrith K S — Portfolio

A responsive, professional portfolio with editorial typography for GitHub Pages. Built with semantic HTML, CSS, and a small vanilla JavaScript enhancement layer; no build step or framework required.

## Local preview

From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. GitHub Pages can serve the repository root directly.

## Editing

- `index.html`: profile, selected work, experience, skills, writing, and contact links.
- `assets/css/portfolio.css`: layout, colors, responsive breakpoints, dark theme, and print styles.
- `assets/js/portfolio.js`: appearance preferences, mobile navigation, experience deep links, progressive reveal animations, and footer year.
- `Ashrith_K_S.pdf`: downloadable resume.
- `images/portrait.jpeg`: profile portrait.

The top Appearance control offers Paper, Ocean, Forest, and Plum palettes; Modern, Editorial, and Mono typography; and Light, Dark, or System display modes. Choices update immediately and are saved locally when browser storage is available. The default mode follows the visitor’s system preference, and Reset appearance restores Paper / Modern / System. Existing light/dark preferences are retained. Content, links, and expandable career highlights remain available without JavaScript. Motion respects the reduced-motion preference. Google Fonts is the only external presentation dependency, with system font fallbacks. Project summaries use a minimalist text layout with lightweight hover effects.

Legacy template assets are retained but are no longer loaded by the site.

The hero and contact section link to the LinkedIn profile, while email remains available as a separate contact option. Professional summaries use the supplied resume content without invented performance metrics.

## Motion

The introduction enters in stages. On scroll, headings wipe upward, cards lift into place with a short stagger across each visible row, and skill badges cascade in. Career dates enter from the side before role details; company logos and contact links have their own sequences. Each block reveals once per page load, and mobile cards enter independently without waiting for offscreen siblings. An animated headline underline, slow portrait zoom, and staggered skill highlights make motion visible after the initial page load. The “Pause animations” control pauses continuous motion and entrances, and saves the choice locally. The site automatically disables motion when the visitor requests reduced motion.

Web Animations, CSS keyframes, and IntersectionObserver provide motion without additional libraries. Content stays readable without JavaScript. Keyboard focus finishes an entrance immediately, and printing cancels animations.

The expertise section includes full stack development, applied AI, Python, Java, IoT, Android, React Native, Arduino, Raspberry Pi, testing, and observability. Skills use prominent badges rather than small secondary labels.
