# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Gatsby 5 / React 19 / react-bootstrap starter for building browser-based Csound instruments (Csound compiled to WASM). A page declares an instrument GUI as a plain JS object; the library in `src/components/lib/` renders it and wires every widget to a Csound control channel. `feature/gatsby5_update` is the main working branch (and GitHub's default branch): work happens on `feature/*` / `fix/*` branches that are fast-forwarded into it; merged branches are kept as archives.

## Commands

Requires Node ≥22 (`engines` in `package.json`, `.nvmrc`). Dependencies alone need ≥20.19.0 (`sass`, `chokidar`), but Node 20 is end-of-life, so the floor is the 22 LTS. The machine's default `node` may be older — run `nvm use` first.

```shell
npm start            # gatsby develop on 0.0.0.0:8000
npm run build        # gatsby build -> public/
npm run serve        # serve the production build
npm run build:pages  # build with pathPrefix (GitHub Pages); serve:pages to test it
npm run format       # prettier --write over src/**/*.{js,jsx}
npm run osc-bridge   # scripts/osc-bridge.js: OSC over UDP 41234 -> ws://localhost:47100 (--help)
npx gatsby clean     # clear .cache/ and public/ (do this before a deploy build)
```

There are no tests (`npm test` is a placeholder echo). Verify changes with `npm run build`, then the dev server, checking that the status bar shows a green **Csound** badge.

There is no lint script or `.eslintrc`, but `gatsby develop` runs ESLint with Gatsby's built-in config (react-app rules) on every bundled file and prints the warnings in the terminal and the browser console (`[HMR] bundle 'develop' has N warnings`). `gatsby build` does not lint. `src/` is currently warning-free; keep it that way.

Deploying under a subpath: `pathPrefix` in `gatsby-config.js` (now `/csound-web-gatsby-react-bootstrap-starter`, for GitHub Pages) applies only to `gatsby build --prefix-paths` (`npm run build:pages`); plain `build`/`develop` ignore it. This is why static assets, links and `window.open` URLs are always referenced through `withPrefix(...)` (or Gatsby's `Link`). `.github/workflows/deploy.yml` builds with the prefix and deploys to GitHub Pages on every push to `feature/gatsby5_update`; the repository's Pages source must be set to "GitHub Actions".

## Architecture

### Data flow

```
page (src/pages/index.js)
  └─ <CsoundInstr inst csd csoundwasm tunings osc keyboard plugins>   lib/csoundinstr.js
       └─ <Instrument inst onChange>                                   lib/instrument.js
            └─ <Panel def> / <TabPanel def>  (recursive)               lib/panel.js, lib/tabpanel.js
                 └─ Fader | Knob | Switch | NumberInput | Toggle | XYPad | Adsr | Scope | custom
```

- **`CsoundInstr`** owns the Csound engine and all note input. In `componentDidMount` it dynamically imports the Csound ESM bundle by URL (`import(/* webpackIgnore: true */ url)`), fetches the `.csd`, writes it into Csound's virtual FS, compiles and starts it. Widget changes arrive in `handleUpdate(id, val)` and become `setControlChannel` / `setStringChannel` calls; object values (e.g. from `xy`) are fanned out one channel per key.
- **`Instrument`** flattens the definition tree into `this.components` keyed by `id`, tracks current values, and implements preset Save/Load as JSON. It is also the target for external control: `setValues`, `setCtrlValue` (MIDI CC), `setDefaultValues`.
- **`Panel`** is the widget factory: a `switch` on `component.type` picks the React component. Adding a new widget type means adding a case here (or passing a `func(def, onChange)` on the definition, which the `default` case calls for custom components).

### The mutated-definition convention

Widgets do not expose refs. Instead each widget, in its constructor, attaches a setter onto the definition object it was given: `this.props.def.changeValue = this.setValue.bind(this)`. `Instrument` then drives widgets by calling `this.components[id].changeValue(v)`. Consequences:

- The `inst` object passed to `CsoundInstr` is mutated at render time (`changeValue`, `osc`, `tooltip` with the original text kept as `tooltipBase`, `widgets` generated for a `multifader`, and `step` for `log` faders). Don't freeze it or share one definition object between two widgets.
- Any new widget must set `def.changeValue` and call `props.onChange(def.id, value)` from it, otherwise defaults, preset loading, MIDI CC and OSC won't reach it.
- Display widgets are the exception: they send nothing and set no `changeValue` (`Instrument.setValues` skips them). `Scope` (`lib/scope.js`) reads the engine from `CsoundContext` (`lib/csoundcontext.js`), which `CsoundInstr` provides once Csound runs as `{csound, audioContext, node}` (`node` from `csound.getNode()`, the output AudioNode), and taps the output with an `AnalyserNode`. Draw such widgets on a plain `<canvas>` in a `requestAnimationFrame` loop outside React state, and disconnect/cancel on unmount.
- Defaults are pushed to Csound by `setDefaultValues()` after the engine starts for every widget that defines a `defval`.

### Contract with the `.csd`

- Every widget `id` must equal a channel name read with `chnget` in the orchestra (exceptions: `xy` uses `idx`/`idy`; `Components.adsr(id)` produces `<id>_a/_d/_s/_r`; a panel with `on: true` sends 0/1 on its own `id`).
- The orchestra must define instruments named `trig` (p4=on/off, p5=MIDI key, p6=velocity) and `freqtrig` (p5=frequency in Hz). It may define `panic`, called by the Panic button/Esc (`hasPanicInstr` is detected from the `.csd` text). `CsoundInstr` plays notes by sending `i "trig" ...` score events in 12edo and `i "freqtrig" ...` when a custom tuning from the `tunings` prop is selected. See `static/rspline.csd`.
- `static/csound.esm.js` is the vendored, minified `@csound/browser` build (~3.8 MB, README says v6.16.1). It is served as a static asset and deliberately kept out of webpack; don't read or edit it.

### Note / control inputs (all funnel into `sendNoteEvent` or `Instrument.setValues`)

Notes are tracked in `this.held`, a Map from source (`kbd:<code>`, `screen:<note>`, `midi:<chn>:<key>`, `osc:<key>`, `freq:`/`oscfreq:<Hz>`) to the score event the note-on sent (`startNote`/`stopNote`); the note-off replays it instead of recomputing it from the current octave/tuning. `allNotesOff()` (Panic) stops every held note, then calls the optional `panic` instrument. Root blur releases the `kbd:` notes. New note sources must pass a stable source id.


- **Computer keyboard**: `noteMap` in `csoundinstr.js`, key handlers on the focused root `Row` (velocity/octave set by the footer faders).
- **WebMIDI** (native Web MIDI API, no library): note on/off (note-on with velocity 0 counts as note-off), plus CC mapped to any widget whose definition has a matching `midictrl` number (scaled into `min..max`). One selected input at a time; `refreshMidiDevices()` rebuilds the device list on the `MIDIAccess` `statechange` event, so hot-plugged devices appear and unplugged ones fall back to another input. Firefox gates Web MIDI behind a site-permission add-on regardless of code.
- **OSC** (enabled by the `osc` prop, a namespace string): `osc-js` WebSocket client to the osc-js bridge on `localhost:47100` (`scripts/osc-bridge.js`, `npm run osc-bridge`; plain Node, CommonJS, not part of the Gatsby build; `--host 0.0.0.0` for senders outside WSL, which also need the firewall rules for UDP 41234 listed in the README; `pd/osc-example.pd` is a Pure Data sender), opened only when the user clicks the "Connect OSC" button (no connection attempt at startup). Addresses: `/<osc>/note`, `/<osc>/notefreq`, `/<osc>/<widgetId>[/<subkey>]`.
- **On-screen keyboard** (enabled by the `keyboard` prop): `src/pages/keyboard.js` opens in a popup and renders `KeyboardLayout` → `Terpstra` (Konva canvas). It talks to the instrument page over a `BroadcastChannel` whose name must match on both sides (`keyboard="rsw"` in `index.js` ↔ `name="rsw"` in `keyboard.js`).

### Build quirks

- `gatsby-node.js` null-loads `canvas` during the HTML build stages (Konva pulls it in under Node) and sets a `dgram: false` resolve fallback for `osc-js`. `DEV_SSR` is off in `gatsby-config.js`. Library code touches `window`, `navigator`, `BroadcastChannel` — keep such access out of module scope and render paths that run during SSR.
- Sass warnings: `gatsby-plugin-sass` runs with `quietDeps: true` and `includePaths: ["node_modules"]`, and `style.scss` loads Bootstrap as `@import "bootstrap/scss/bootstrap"` (load path, not a relative path) so Bootstrap 5's own deprecation warnings are hidden; `legacy-js-api` is silenced too. The only expected warnings are the 4 `@import` lines in `style.scss` (Bootstrap 5 can't be loaded with `@use`). Don't move to Dart Sass 3 before Bootstrap 6.
- Styles: `gatsby-browser.js` imports only `src/styles/style.scss`, which loads `_variables` (design tokens: `$cs-*` palette, spacing, radius, plus the Bootstrap variable overrides — must come before Bootstrap), Bootstrap, `_layout`, and `_cs` (instrument/widget classes such as `patcol`, `patlabel`, `dbgreen`, and the palette as `--cs-*` CSS variables). Use the tokens instead of hard-coded colours. Keep global CSS imported only from `gatsby-browser.js`: importing it from components makes mini-css-extract-plugin warn about conflicting order between pages.
- Production inlines the CSS into a `<style>` tag in every page, so the CSS must stay pure ASCII: a BOM there invalidates Bootstrap's `:root` variables (fonts, colours). `gatsby-config.js` handles it with Sass `charset: false` plus a small PostCSS plugin that re-escapes non-ASCII characters (Bootstrap's blockquote "—"). Development doesn't inline, so check style changes in a production build too.
- Gatsby's cache doesn't reliably pick up changes to Sass partials or plugin options: run `npx gatsby clean` before building when checking style changes.
- JSX: `gatsby-config.js` sets `jsxRuntime: "automatic"` (Gatsby 5 defaults to classic, which React 19 flags in development). `import React` is only needed for hooks/`React.Component`, not for JSX.
- Design: `design/` holds the Figma files (`csound-web-ui.fig`, `csound-web-ui-v2.fig`) and `design/system/`, a design system generated from the code (`tokens.json` mirrors `_variables.scss`; guidelines in `design/system/README.md`; per-component previews). The code is the source of truth: when changing tokens or widget styles, update `design/system/` to match.
- Document head: no react-helmet. Each page exports `Head` (Gatsby Head API) rendering `<Seo title="…" />` from `src/components/seo.js` (title, description from `siteMetadata`, keywords); `<html lang>` is set in `gatsby-ssr.js` (`onRenderBody`). A new page needs its own `export const Head`.

## Conventions

- Plain JavaScript, mostly React class components; no TypeScript.
- React 19: `propTypes` are no longer checked at runtime (kept as documentation only), and `defaultProps` only works on class components — use default parameters in function components. `react-numeric-input` was replaced by `lib/spinner.js` (a `NumericFormat` wrapper) for React 19 compatibility.
- Prettier config: no semicolons, double quotes, 2-space indent, `es5` trailing commas. Existing files are not uniformly formatted — match the file you are editing rather than reformatting it.
- `src/components/lib/` is a reusable component library with its own LICENSE/README (vendored from a separate "react-components" project); keep app-specific code in `src/pages/` and `src/components/`.
- The `CsoundInstr` props and the widget definition options (panel, tabpanel, fader/knob, multifader, spinner, xy, select, toggle, adsr, plus the common `midictrl`/`tooltip`) are documented in tables in `README.md`; update them when changing a prop or a widget's definition schema. The README's example page is a copy of `src/pages/index.js`: keep them identical.
