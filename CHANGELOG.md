# Changelog

## 1.1.0 (2026-10-19)

Several instruments in one site: each **patch** (a Csound orchestra plus its GUI definition) gets its own page, and a second instrument, an FM Synth, joins Random Spline Waves.

**Live demo:** https://dizzisound.github.io/csound-web-gatsby-react-bootstrap-starter/

### New

- **Patches**: an instrument is a file in `src/patches/` (slug, title, description, `.csd`, OSC namespace, tunings, GUI) plus a small page in `src/pages/patch/`; the README explains how to add one. Random Spline Waves now lives at `/patch/rspline/`.
- **Home page and menu**: the home page lists the instruments, and the header (now "Web Csound Instruments") links to each of them. Browser tabs read "<instrument> – Web Csound Instruments".
- **FM Synth** (`/patch/fm/`): two-operator FM with ratio and index, a brightness envelope that makes notes start bright and darken, an ADSR, and a scope; OSC namespace `/fm`.
- **Patch check** (development only): when a patch page loads under `npm start`, the console warns about widgets whose channel the orchestra never reads, duplicate widget ids, and a missing `trig` or `freqtrig` instrument.
- Presets are saved as `<instrument>-preset.json` (was `file.json`).

### Fixes

- Leaving an instrument page released Csound's sound but left its AudioContext running, one more per visit; leaving while Csound was still loading started it anyway, with a page error. Both are fixed, which makes switching instruments safe.
- Random Spline Waves: the ADSR panel's on/off switch did nothing; off now plays a plain gate. It starts on, so the default sound is unchanged. The Pd example's `adsr_on` toggle now works too.
- A knob's unit label was not centered; the panel switch reports its state to screen readers as true/false.

### Changes for developers

- The GUI definition of a patch is a function, `inst: () => ({ components: [...] })`, so each visit gets a fresh object.
- The screen keyboard and the instrument pages share one channel name, `KEYBOARD_CHANNEL` (`src/components/keyboardchannel.js`), instead of `"rsw"`.
- `feature/library_refactoring` is the default branch and deploys the demo; `feature/gatsby5_update` stays at 1.0.0.

## 1.0.0 (2026-10-18)

The first release of this fork of [docB's csound-web-gatsby-react-bootstrap-starter](https://github.com/docb/csound-web-gatsby-react-bootstrap-starter) (2021). It moves the starter to current Gatsby and React, restyles the instrument, fixes long-standing input bugs and adds new ways to play and see it.

**Live demo:** https://dizzisound.github.io/csound-web-gatsby-react-bootstrap-starter/

### Platform

- Gatsby 5.16, React 19.3, react-bootstrap 2.10 with Bootstrap 5.3, Dart Sass. Requires Node 22 or newer (`.nvmrc` included).
- The Gatsby Head API replaces react-helmet; the automatic JSX runtime is on; deprecated APIs are gone (`StaticQuery`, `componentWillReceiveProps`, `defaultProps` on function components, `noGutters`, Sass `darken`/`lighten`).
- `react-numeric-input`, incompatible with React 19, is replaced by a new Spinner.
- `src/` builds without ESLint warnings.
- License: LGPL-3.0-or-later.
- Csound itself is unchanged: the vendored `@csound/browser` 6.16.1.

### New

- **Restyled UI**: design tokens, a dark navy and yellow palette, the system font, status badges, value units. A design system generated from the code lives in `design/system/`.
- **Scope**: a `scope` widget showing Csound's output as a waveform or a spectrum, with a display-only `gain`.
- **Panic**: a skull button (or Esc) that stops every sounding note, plus an optional `panic` instrument in the orchestra.
- **OSC bridge**: `npm run osc-bridge` relays OSC from UDP 41234 to the page's WebSocket (`--host`, `--verbose`, `--help`). OSC is opt-in through the **Connect OSC** button.
- **Pure Data example**: `pd/osc-example.pd` sends notes and widget values, with connect boxes for localhost and for WSL.
- **MIDI**: devices plugged in after the page loaded appear by themselves; the status bar explains why MIDI is unavailable.
- **GitHub Pages**: a workflow deploys the site on every push to `feature/gatsby5_update` (since 1.1.0: `feature/library_refactoring`); `npm run build:pages` and `serve:pages` build and test the prefixed site locally.

### Fixes

- Stuck notes: a note-off now always reaches its note, even when the key is released in a text field or the octave or tuning changes while it is held; MIDI note-on with velocity 0 counts as note-off.
- Faders sent each value up to three times.
- Multifader, toggle, partial XY updates and logarithmic knobs (see `fix/known-issues`); XY read-outs and tooltips.
- Spinner: unbounded defaults, hold-to-repeat, typed digits playing notes.
- Primary buttons had dark-blue text on blue.
- The production build lost Bootstrap's CSS variables to a byte-order mark in the inlined CSS.

### Documentation

- README and CLAUDE.md synced with the code: `CsoundInstr` props, every component's options, the orchestra contract (`trig`, `freqtrig`, optional `panic`), OSC addresses, Windows + WSL networking for OSC, deploying.

### Known limitations

- The screen keyboard's 31jt, 53jt and 12jt tabs can be played only with the mouse or touch.
- Firefox enables Web MIDI only with its site-permission add-on.
- OSC from the live demo to a bridge on `localhost` depends on the browser's rules for public sites reaching local addresses.
- The build log shows `ERROR UNKNOWN` for a Node deprecation warning (`punycode`) from Gatsby's own dependencies; the build is not affected.
