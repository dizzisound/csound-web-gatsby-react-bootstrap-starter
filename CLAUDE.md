# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Gatsby 5 / React 19 / react-bootstrap starter for building browser-based Csound instruments (Csound compiled to WASM). A page declares an instrument GUI as a plain JS object; the library in `src/components/lib/` renders it and wires every widget to a Csound control channel. `feature/gatsby5_update` holds the migration from an older Gatsby to Gatsby 5; `feature/react19_update` builds the React 19 upgrade on top of it.

## Commands

Requires Node ≥22 (`engines` in `package.json`, `.nvmrc`). Dependencies alone need ≥20.19.0 (`sass`, `chokidar`), but Node 20 is end-of-life, so the floor is the 22 LTS. The machine's default `node` may be older — run `nvm use` first.

```shell
npm start            # gatsby develop on 0.0.0.0:8000
npm run build        # gatsby build -> public/
npm run serve        # serve the production build
npm run format       # prettier --write over src/**/*.{js,jsx}
npx gatsby clean     # clear .cache/ and public/ (do this before a deploy build)
```

There are no tests (`npm test` is a placeholder echo). Verify changes with `npm run build`, then the dev server, checking that the status cell shows "Csound running".

There is no lint script or `.eslintrc`, but `gatsby develop` runs ESLint with Gatsby's built-in config (react-app rules) on every bundled file and prints the warnings in the terminal and the browser console (`[HMR] bundle 'develop' has N warnings`). `gatsby build` does not lint. `src/` is currently warning-free; keep it that way.

Deploying under a subpath: set `pathPrefix` in `gatsby-config.js`, then `gatsby clean && gatsby build --prefix-paths`. This is why static assets are always referenced through `withPrefix(...)`.

## Architecture

### Data flow

```
page (src/pages/index.js)
  └─ <CsoundInstr inst csd csoundwasm tunings osc keyboard plugins>   lib/csoundinstr.js
       └─ <Instrument inst onChange>                                   lib/instrument.js
            └─ <Panel def> / <TabPanel def>  (recursive)               lib/panel.js, lib/tabpanel.js
                 └─ Fader | Knob | Switch | NumberInput | Toggle | XYPad | Adsr | custom
```

- **`CsoundInstr`** owns the Csound engine and all note input. In `componentDidMount` it dynamically imports the Csound ESM bundle by URL (`import(/* webpackIgnore: true */ url)`), fetches the `.csd`, writes it into Csound's virtual FS, compiles and starts it. Widget changes arrive in `handleUpdate(id, val)` and become `setControlChannel` / `setStringChannel` calls; object values (e.g. from `xy`) are fanned out one channel per key.
- **`Instrument`** flattens the definition tree into `this.components` keyed by `id`, tracks current values, and implements preset Save/Load as JSON. It is also the target for external control: `setValues`, `setCtrlValue` (MIDI CC), `setDefaultValues`.
- **`Panel`** is the widget factory: a `switch` on `component.type` picks the React component. Adding a new widget type means adding a case here (or passing a `func(def, onChange)` on the definition, which the `default` case calls for custom components).

### The mutated-definition convention

Widgets do not expose refs. Instead each widget, in its constructor, attaches a setter onto the definition object it was given: `this.props.def.changeValue = this.setValue.bind(this)`. `Instrument` then drives widgets by calling `this.components[id].changeValue(v)`. Consequences:

- The `inst` object passed to `CsoundInstr` is mutated at render time (`changeValue`, `osc`, `tooltip`, and `step` for `log` faders). Don't freeze it or share one definition object between two widgets.
- Any new widget must set `def.changeValue` and call `props.onChange(def.id, value)` from it, otherwise defaults, preset loading, MIDI CC and OSC won't reach it.
- Defaults are pushed to Csound by `setDefaultValues()` after the engine starts for every widget that defines a `defval`.

### Contract with the `.csd`

- Every widget `id` must equal a channel name read with `chnget` in the orchestra (exceptions: `xy` uses `idx`/`idy`; `Components.adsr(id)` produces `<id>_a/_d/_s/_r`; a panel with `on: true` sends 0/1 on its own `id`).
- The orchestra must define instruments named `trig` (p4=on/off, p5=MIDI key, p6=velocity) and `freqtrig` (p5=frequency in Hz). `CsoundInstr` plays notes by sending `i "trig" ...` score events in 12edo and `i "freqtrig" ...` when a custom tuning from the `tunings` prop is selected. See `static/rspline.csd`.
- `static/csound.esm.js` is the vendored, minified `@csound/browser` build (~3.8 MB, README says v6.16.1). It is served as a static asset and deliberately kept out of webpack; don't read or edit it.

### Note / control inputs (all funnel into `sendNoteEvent` or `Instrument.setValues`)

- **Computer keyboard**: `noteMap` in `csoundinstr.js`, key handlers on the focused root `Row` (velocity/octave set by the footer faders).
- **WebMIDI**: note on/off, plus CC mapped to any widget whose definition has a matching `midictrl` number (scaled into `min..max`).
- **OSC** (enabled by the `osc` prop, a namespace string): `osc-js` WebSocket client to an osc-js bridge on `localhost:47100`, opened only when the user clicks the "Connect OSC" button (no connection attempt at startup). Addresses: `/<osc>/note`, `/<osc>/notefreq`, `/<osc>/<widgetId>[/<subkey>]`.
- **On-screen keyboard** (enabled by the `keyboard` prop): `src/pages/keyboard.js` opens in a popup and renders `KeyboardLayout` → `Terpstra` (Konva canvas). It talks to the instrument page over a `BroadcastChannel` whose name must match on both sides (`keyboard="rsw"` in `index.js` ↔ `name="rsw"` in `keyboard.js`).

### Build quirks

- `gatsby-node.js` null-loads `canvas` during the HTML build stages (Konva pulls it in under Node) and sets a `dgram: false` resolve fallback for `osc-js`. `DEV_SSR` is off in `gatsby-config.js`. Library code touches `window`, `navigator`, `BroadcastChannel` — keep such access out of module scope and render paths that run during SSR.
- Styles: `gatsby-browser.js` imports `src/styles/style.scss` (full Bootstrap SCSS plus `_variables`, `_layout`, `_cs`: the instrument/widget classes such as `patcol`, `patlabel`, `dbgreen`) and then `src/components/layout.css` (global html/body base styles). Keep global CSS imported only there: importing it from components makes mini-css-extract-plugin warn about conflicting order between pages.
- JSX: `gatsby-config.js` sets `jsxRuntime: "automatic"` (Gatsby 5 defaults to classic, which React 19 flags in development). `import React` is only needed for hooks/`React.Component`, not for JSX.
- Document head: no react-helmet. Each page exports `Head` (Gatsby Head API) rendering `<Seo title="…" />` from `src/components/seo.js` (title, description from `siteMetadata`, keywords); `<html lang>` is set in `gatsby-ssr.js` (`onRenderBody`). A new page needs its own `export const Head`.

## Conventions

- Plain JavaScript, mostly React class components; no TypeScript.
- React 19: `propTypes` are no longer checked at runtime (kept as documentation only), and `defaultProps` only works on class components — use default parameters in function components. `react-numeric-input` was replaced by `lib/spinner.js` (a `NumericFormat` wrapper) for React 19 compatibility.
- Prettier config: no semicolons, double quotes, 2-space indent, `es5` trailing commas. Existing files are not uniformly formatted — match the file you are editing rather than reformatting it.
- `src/components/lib/` is a reusable component library with its own LICENSE/README (vendored from a separate "react-components" project); keep app-specific code in `src/pages/` and `src/components/`.
- The widget definition options (panel, fader/hfader/knob, spinner, xy, select) are documented in tables in `README.md`; update them when changing a widget's definition schema.
