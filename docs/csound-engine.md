# The Csound engine: from 6.16 to 6.18

This page is for developers. It records why and how the starter moved its Csound engine from 6.16 to 6.18 (fine-tuning step 4, after release 1.1.0), so the next upgrade can follow the same path.

## What the starter uses

Csound runs in the browser as WebAssembly, packaged by [`@csound/browser`](https://www.npmjs.com/package/@csound/browser). The starter vendors that package's single ES module as `static/csound.esm.js`: it is served as a static file and loaded at run time by `CsoundInstr` (`import(/* webpackIgnore: true */ url)`), outside webpack. Upgrading means replacing that one file and checking the calls the library makes.

| | Before | After |
|---|---|---|
| `@csound/browser` package | 6.16.0 (an early-2021 beta: npm never published a final 6.16) | **6.18.7** (February 2023, the last release of the 6 series) |
| Csound engine (`csound.getVersion()`) | 6160 (6.16.0) | **6181 (6.18.1)**: the package and the engine are numbered separately |
| API version (`getAPIVersion()`) | 400 | 400 |
| File | one ES module, 3.81 MB | one ES module (`dist/csound.js`), 3.78 MB |
| License | LGPL-2.1 | LGPL-2.1 |

The README used to say "6.16.1"; the running engine reported 6.16.0. Since 6.18.7 only `7.0` betas have been published (`7.0.0-beta41` at the time of writing); a beta was not a good fit for a public demo.

## What changed for the starter

The library calls 13 Csound methods. Twelve exist unchanged in 6.18.7: `compileCsd`, `start`, `stop`, `destroy`, `readScore`, `setControlChannel`, `setStringChannel`, `getControlChannel`, `tableCopyOut`, `tableLength`, `getAudioContext`, `getNode`. So the scope (which taps `getNode()`) and the clean teardown (`stop`, `destroy`, then closing the AudioContext) work as before.

One broke: **the virtual file system**. In 6.16, `csound.fs` offered synchronous Node-style calls, and `CsoundInstr` loaded a patch with `csound.fs.writeFileSync(name, text)` followed by `compileCsd(name)`. In 6.18, `csound.fs` is a small asynchronous API (`writeFile(path, Uint8Array)`, `readFile`, `appendFile`, `unlink`, `readdir`, `mkdir`, all returning promises) and `writeFileSync` is gone.

The fix avoids the file system altogether: `CsoundInstr` now compiles the orchestra from its text with **`compileCsdText(text)`**, which both versions have. That change went in first, on 6.16, and was tested there before the engine was swapped, so each half could be verified (and reverted) on its own.

6.18.7 also has new options for `Csound({...})`, not used yet: `audioContext` (pass your own), `autoConnect`, `inputChannelCount` / `outputChannelCount`, `useWorker` (run Csound in a Web Worker), `useSAB` (SharedArrayBuffer between threads, when the page is cross-origin isolated) and `useSPN` (force the old ScriptProcessorNode). Its `destroy()` also closes the AudioContext itself; `CsoundInstr.releaseEngine` only closes it if it is still open, so the two don't conflict.

## How it was verified

1. **The package**: downloaded from npm and checked against the registry's published integrity hash (`sha512-pHC83n1f…u0+u0qw==`, matching); the vendored file is the package's `dist/csound.js` unchanged (SHA-256 `f7c8c902cf71c9201193c3e9885c187b71c07585f1b957d1613610f7076b9035`).
2. **A trial** in a separate copy of the project, then **the real branch**, with the browser tests used through the fine-tuning steps (Chromium, production builds):

| Test | 6.16 + `compileCsdText` | 6.18.7 |
|---|---|---|
| home page, menu, both instruments, preset file name | ✅ | ✅ |
| FM Synth: brightness envelope (spectral centroid falls from about 1400 to 792 Hz), index 0 gives a pure 262 Hz sine | ✅ | ✅ |
| Panic: release in a text field, octave or tuning changed while held, Esc, Panic on notes the page didn't start | ✅ | ✅ |
| teardown: every AudioContext closed after leaving, including while Csound was still loading | ✅ | ✅ |
| Random Spline Waves' ADSR switch (slow attack on, full level off) | ✅ | ✅ |
| scope: wave and spectrum | ✅ | ✅ |
| screen keyboard from the computer keyboard (12edo and 31jt pitches) | ✅ | ✅ |
| page errors | none | none |

## Good to know

- **Sample rate**: in the browser, Csound runs at the AudioContext's rate (44.1 or 48 kHz, depending on the system) and the `sr = 48000` line in an orchestra doesn't change it. This was already true with 6.16.
- **Threads**: the demo is not cross-origin isolated (GitHub Pages can't send the needed headers), so `SharedArrayBuffer` is unavailable and Csound uses its default single-thread AudioWorklet path; nothing to configure.
- **Not covered by the automated tests**: Firefox and Safari, real MIDI hardware, and long listening for audio glitches or CPU load. Listen to both instruments in your browsers before deploying.
- **Next upgrade**: when `@csound/browser` 7 is stable, repeat the same steps: list the calls the library makes (`grep -o "csound\.[a-zA-Z.]*(" src -r`), compare them with the new package's `index.d.ts`, verify the download's integrity, try it in a copy, then swap `static/csound.esm.js`.
