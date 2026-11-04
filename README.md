# Portfolio / Perspective Tunnel Hero

The existing HTML portfolio and resumes remain standalone pages. A React island mounts the adapted 21st.dev Perspective Tunnel Hero in Graphic mode. Its Tailwind stylesheet lives in a shadow root, so preflight does not restyle the existing pages.

## Setup and development

```sh
npm install
npm run build
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.
Open the printed local URL with `?mode=graphic`. After editing React or CSS, run `npm run build` and refresh: the existing HTML loads the compiled `assets/tunnel/hero.js`. This bundle is included so existing static hosting and Python HTTP servers also work without a React server. Production is served by GitHub Pages from the root of the `Portfolio-Version01` branch: https://klaichit.github.io/portfolio/

## Structure

- `components/ui/perspective-tunnel-hero.tsx`: reusable React/TypeScript hero, adapted from the user-supplied MIT component by Daiwiik Harihar: https://21st.dev/@daiwiikharihar/components/perspective-tunnel-hero
- `components/demo.tsx`: standalone demo using verified Unsplash stock URLs. It is an importable component, not an additional public page.
- `src/main.tsx`: mounts/unmounts on portfolio mode changes and supplies actual portfolio images and the gallery navigation callback.
- `src/styles.css`: Tailwind v4 entry and scoped hero styling.
- `components.json`, `tsconfig.json`, `lib/utils.ts`: shadcn-compatible aliases and class merging utility. `@/` resolves to the project root.
- `assets/tunnel/hero.js`: generated static bundle; do not edit directly.

`components/ui` is the configured default component location. Keeping it matches the supplied imports and lets shadcn CLI resolve future UI components consistently. This existing project has been configured manually rather than scaffolding over the HTML site. To add a component later, use `npx shadcn@latest add <component>`; no additional `init` is needed. If adding components with new theme tokens, define those in `src/styles.css`.

React, React DOM, Framer Motion, Tailwind, TypeScript and Vite are installed through the lockfile. No context provider or icon dependency is required by this component.

## Integration changes

Golden-angle card placement, Z-axis travel, spring smoothing, pointer parallax, and depth rings are retained. Native scroll drives progress through a sticky stage instead of capturing wheel events. This supports touch, keyboard and scrolling into the gallery. The View Selected Work button skips the animation and transfers focus to the gallery heading.

`images?: TunnelImage[]` supplies image/title pairs; `onExplore?: () => void` supplies navigation. The default stock assets are for the demo only; the actual portfolio uses nine local project previews. Cards in the tunnel are decorative; full project viewing is available in the gallery. Reduced-motion mode displays static images, removes the extended scroll distance and disables camera movement. It responds to preference changes while the page is open.

## Curved selected-work section

`components/ui/tilted-grid-hero.tsx` integrates the user-supplied cylindrical sliced-image component. `components/graphic-work.tsx` supplies local portfolio images, category filtering, a pause control and keyboard-accessible project buttons connected to the existing media viewer. The decorative band pauses offscreen and under reduced-motion preferences. `components/tilted-grid-demo.tsx` contains a standalone stock-image demo. No extra dependency or provider is required. The section mounts in its own shadow root to isolate Tailwind from the original portfolio.

The work browser uses the approved Editorial Mix layout: a full-poster lead beside a video and website preview, followed by large two-column project cards. Mobile uses one column. Posters and videos preserve their aspect ratios; website cards show a top-aligned crop and open the full page capture in the viewer.

## Thai / English

All 23 HTML entry pages include `assets/i18n-th.js` (reviewed Thai text), `assets/i18n.js` (language selection and dynamic DOM translation), and `assets/i18n.css` (Thai typography and shared language switch). Use `?lang=th` or `?lang=en`; the URL takes priority over the remembered local preference. The switch preserves mode and anchor, and local HTML links carry the language forward. The existing native Thai graphic resume stays available; its English switch returns to the English counterpart.

Translations cover visible content, project descriptions, dynamically inserted gallery labels, accessible image/button labels, and page titles/descriptions. Brand, game, software and personal names remain unchanged. Existing artwork and external embedded videos retain their original language. No external translation API is called. Original English strings are retained in weak maps for reversible switching; observers cover both document and React shadow roots. Add new copy to `assets/i18n-th.js` when extending the site.
