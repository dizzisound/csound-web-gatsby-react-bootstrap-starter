# csound-web-gatsby-react-bootstrap-starter
This starter can be used to quickly set up a csound-web (v 6.16.1) project developed with Gatsby 5, React 19 and react-bootstrap.
It ships with two small Csound instruments (patches): Random Spline Waves, which morphs random spline wavetables, and an FM Synth.

**Live demo:** https://dizzisound.github.io/csound-web-gatsby-react-bootstrap-starter/ (pick an instrument, click **Start audio** if the browser paused it, then play with the computer keyboard: Z S X D C … or Q 2 W 3 E …).

What changed in each release: [CHANGELOG.md](CHANGELOG.md).

## Quick start
1.  **What you need**

    Node.js 22+ (an `.nvmrc` is included: run `nvm use` in the project folder)

1.  **Create a site**

    ```shell
    npx gatsby new my_new_csound_web_project https://github.com/dizzisound/csound-web-gatsby-react-bootstrap-starter
    ```

    or clone the repository and install the dependencies:

    ```shell
    git clone https://github.com/dizzisound/csound-web-gatsby-react-bootstrap-starter my_new_csound_web_project
    cd my_new_csound_web_project
    npm install
    ```

1.  **Start developing**

    ```shell
    cd my_new_csound_web_project
    nvm use
    npm start
    ```

The Csound web app is now running at `http://localhost:8000`.
If all worked well, the status bar shows a green **Csound** badge (amber while loading, red on an error).
If the browser paused audio, click **▶ Start audio**.

## What now?

### Highlevel
You can use this starter without any deeper js/react knowhow. Each instrument is a **patch**: a Csound orchestra (`.csd`) in `static/`
plus a JS object describing its GUI in `src/patches/`. This is `src/patches/rspline.js`:

```jsx
import Components from "../components/lib/components"

// Random Spline Waves: four random spline wavetables, morphed by the XY pad
// and the weight fader. Orchestra: static/rspline.csd.
const rspline = {
  slug: "rspline",
  title: "Random Spline Waves",
  description: "Four random spline wavetables, morphed with the XY pad and the weight fader.",
  csd: "rspline.csd", // a file in static/
  osc: "rsw", // OSC namespace: /rsw/note, /rsw/<widgetId>, ...
  keyboard: true, // offer the screen keyboard popup
  // The GUI definition, as a function: the library mutates the object it gets,
  // so each visit to the page builds a fresh one.
  inst: () => ({
    components: [
      {
        type: "panel", label: "morph", id: "morph", widgets: [
          { id: "weight", type: "fader", label: "WGT", min: 0, max: 1, step: 0.01, defval: 0.5, height: 200 },
          {
            id: "xy",
            idx: "num1",
            idy: "num2",
            type: "xy",
            label: "mix",
            minX: 0,
            maxX: 3.99,
            minY: 0,
            maxY: 3.99,
            step: 0.01,
            defval: { num1: 0.5, num2: 0.5 },
            height: 200,
          },
        ],
      },
      {
        type: "panel", label: "waves", id: "waves", widgets: [
          {
            type: "panel", label: "wave 0", id: "wave0", vertical: true, widgets: [
              { id: "wavesteps_0", type: "knob", label: "steps", min: 4, max: 16, step: 1, defval: 10 },
              {
                id: "waveseed_0",
                type: "spinner",
                label: "seed",
                size: 4,
                min: 1,
                max: 100000,
                step: 1,
                defval: 11,
                vertical: false,
              },
            ],
          },
          {
            type: "panel", label: "wave 1", id: "wave1", vertical: true, widgets: [
              { id: "wavesteps_1", type: "knob", label: "steps", min: 4, max: 16, step: 1, defval: 10 },
              {
                id: "waveseed_1",
                type: "spinner",
                label: "seed",
                size: 4,
                min: 1,
                max: 100000,
                step: 1,
                defval: 12,
                vertical: false,
              },
            ],
          },
          {
            type: "panel", label: "wave 2", id: "wave2", vertical: true, widgets: [
              { id: "wavesteps_2", type: "knob", label: "steps", min: 4, max: 16, step: 1, defval: 10 },
              {
                id: "waveseed_2",
                type: "spinner",
                label: "seed",
                size: 4,
                min: 1,
                max: 100000,
                step: 1,
                defval: 13,
                vertical: false,
              },
            ],
          },
          {
            type: "panel", label: "wave 3", id: "wave3", vertical: true, widgets: [
              { id: "wavesteps_3", type: "knob", label: "steps", min: 4, max: 16, step: 1, defval: 10 },
              {
                id: "waveseed_3",
                type: "spinner",
                label: "seed",
                size: 4,
                min: 1,
                max: 100000,
                step: 1,
                defval: 14,
                vertical: false,
              },
            ],
          },
        ],
      },
      // the envelope panel; its on/off switch (channel "adsr1") starts on
      { ...Components.adsr("adsr1"), defval: 1 },
      {
        type: "panel", label: "master", id: "master", widgets: [
          { id: "amp", type: "fader", label: "amp", min: 0, max: 1, step: 0.01, defval: 0.6, height: 200 },
          { id: "rev", type: "fader", label: "reverb", min: 0, max: 1, step: 0.01, defval: 0.6, height: 200 },
        ],
      },
      {
        type: "panel", label: "output", id: "output", widgets: [
          { id: "scope", type: "scope", label: "scope", width: 300, height: 176, gain: 4 },
        ],
      },
    ],
  }),
  // extra tunings for the tuning menu (12edo is always first)
  tunings: [
    {
      name: "blue",
      basekey: 0,
      basefreq: 8.25,
      scale: [1, 21 / 20, 10 / 9, 7 / 6, 5 / 4, 21 / 16, 7 / 5, 3 / 2, 25 / 16, 5 / 3, 7 / 4, 15 / 8],
    },
    {
      name: "overtone",
      basekey: 0,
      basefreq: 8.25,
      scale: [1, 17 / 16, 9 / 8, 19 / 16, 5 / 4, 21 / 16, 11 / 8, 3 / 2, 13 / 8, 27 / 16, 7 / 4, 15 / 8],
    },
    {
      name: "monte",
      basekey: 10,
      basefreq: 4.58333,
      scale: [1, 64 / 63, 9 / 8, 8 / 7, 7 / 6, 4 / 3, 21 / 16, 3 / 2, 32 / 21, 14 / 9, 16 / 9, 7 / 4],
    },
  ],
}

export default rspline
```

`src/patches/fm.js` (with `static/fm.csd`) is a second, smaller example: a two-operator FM synth whose envelope reuses `Components.adsr` with its own defaults.

To add a patch:
1. Put its orchestra in `static/`, e.g. `static/mypatch.csd`, following the rules below.
2. Write `src/patches/mypatch.js` like the one above: `slug` (its URL, `/patch/<slug>/`), `title`, `description`, `csd`,
   the GUI as a function `inst: () => ({ components: [...] })` (see Components), and optionally `osc`, `keyboard`, `tunings` and `plugins` (see CsoundInstr).
3. Add it to the list in `src/patches/index.js`.
4. Give it a page: copy `src/pages/patch/rspline.js` to `src/pages/patch/mypatch.js` and import your patch there.

The home page and the header menu list every patch. A patch page shows its `title` as the heading and in the browser tab
(`Random Spline Waves – Web Csound Instruments`; the site name is `siteMetadata.title` in `gatsby-config.js`).
Pages set their `<title>` and meta tags with `export const Head` (Gatsby Head API, see `src/components/seo.js`).

The following rules apply. In development (`npm start`), each patch page checks them when it loads and prints a **Patch check** warning in the browser console for every widget whose channel the orchestra never reads, every duplicate widget id, and a missing `trig` or `freqtrig` (`src/components/lib/patchcheck.js`; it reads the `.csd` as text, so channel names built at run time from variables can't be seen, while `sprintf` formats like `"waveseed_%d"` can). Production builds leave the check out.

   - The `id` of each component must match a channel name read with `chnget` in the Csound instrument in the `static` folder
       (exceptions: `idx` and `idy` of the xy component, and `<id>_a`, `<id>_d`, `<id>_s`, `<id>_r` of the adsr components).
   - To play the instrument with MIDI, the computer keyboard, the screen keyboard or OSC, the instrument must provide two trigger instruments,
       `trig` and `freqtrig`, as in `static/rspline.csd`:

```csound-orc
opcode freqtrigger,0,iiii
  insno,ion,ifreq,ivel xin
  print insno,ion,ifreq,ivel
  if ion == 1 then
    event "i",insno+(ifreq*0.00001),0,-1,ifreq,ivel
  else
    turnoff2 insno+(ifreq*0.00001),4,1
  endif
endop

opcode notetrigger,0,iiii
  insno,ion,ikey,ivel xin
  ifreq = cpsmidinn(ikey)
  freqtrigger insno,ion,ifreq,ivel
endop

instr trig
  insno = nstrnum("rspline")
  notetrigger insno,p4,p5,p6
  turnoff
endin

/* for other tunings */
instr freqtrig
  insno = nstrnum("rspline")
  freqtrigger insno,p4,p5,p6
  turnoff
endin
```

`trig` receives p4 = on/off (1/0), p5 = MIDI key, p6 = velocity. `freqtrig` receives a frequency in Hz as p5 instead of a key; it is used when one of the `tunings` is selected.
A note-off repeats its note-on's p5 (the page remembers what each held key started), so changing the octave or the tuning while a note is held still stops it.

   - Optionally, an instrument named `panic`: the **Panic** button (and the Esc key) calls it with `i "panic" 0 0.1` after sending a note-off for every note the page started, to stop anything else still sounding. `static/rspline.csd` releases all its voices:
```csound-orc
instr panic
  turnoff2 nstrnum("rspline"), 0, 1
  turnoff
endin
```

### CsoundInstr

| prop | type | description | mandatory |
|------|------|-----------------------------|-------------|
| csoundwasm | string | URL of the Csound ESM bundle, e.g. `withPrefix("csound.esm.js")` | yes |
| csd | string | URL of the `.csd` file, e.g. `withPrefix("rspline.csd")` | yes |
| inst | object | the GUI definition: `{ components: [...] }` (see Components) | yes |
| tunings | array | extra tunings for the tuning menu; `12edo` is always first. Each is `{ name, basekey, basefreq, scale }`, with `scale` the 12 frequency ratios of an octave | yes (may be `[]`) |
| plugins | array | Csound plugins, passed to `Csound({ withPlugins })` | no |
| osc | string | OSC namespace (e.g. `"rsw"`); shows the **Connect OSC** button | no |
| keyboard | string | name of the `BroadcastChannel` shared with `src/pages/keyboard.js`; shows the **Screen keyboard** button. Patch pages pass `KEYBOARD_CHANNEL` (`src/components/keyboardchannel.js`) when the patch sets `keyboard: true` | no |
| name | string | used in the preset file name, `<name>-preset.json` (patch pages pass the slug) | no |
| onStart | function | called once Csound is running | no |

### Playing and controlling the instrument
- **Computer keyboard**: click the instrument area first. Two rows play notes: `Z S X D C V G B H N J M , L .` (lower) and `Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P [ = ]` (upper); velocity and octave are set in the footer. Keys typed into a number field don't play notes. Moving the focus away from the instrument (a text field, another window or tab) releases the notes held on the computer keyboard.
- **Panic** (the skull button in the status bar, or Esc): stops every sounding note, for a note stuck because its note-off never arrived (e.g. a MIDI cable pulled, an OSC sender stopped mid-note, the screen keyboard closed while a key was held).
- **Screen keyboard**: **Screen keyboard** opens `src/pages/keyboard.js` in a popup (12edo and just-intonation hexagon layouts, `.scl` files can be loaded).
- **MIDI** (Chrome, Edge, Opera; Firefox 108+ only with its site-permission add-on, or `dom.webmidi.gated` set to `false` in `about:config`): pick the input device and channel in the status bar. Devices plugged in after the page loaded appear automatically. A widget with a `midictrl` number follows that MIDI CC (scaled into its `min`..`max`).
- **OSC**: needs the bridge from UDP to WebSocket on `ws://localhost:47100` (`npm run osc-bridge`, see below); click **Connect OSC**. Addresses, with `rsw` being the `osc` namespace:

| address | arguments | effect |
|---|---|---|
| `/rsw/note` | on (1/0), MIDI key, velocity | play or stop a note (`trig`) |
| `/rsw/notefreq` | on (1/0), frequency in Hz, velocity | play or stop a note by frequency (`freqtrig`) |
| `/rsw/<widget id>` | value | set a widget, e.g. `/rsw/weight 0.75` |
| `/rsw/<panel id>` | 1 or 0 | switch an on/off panel |

The xy component takes one coordinate per message: `/rsw/xy/num1 0.5` (`/rsw/<id>/<idx or idy>`).

The bridge is included: `npm run osc-bridge` relays OSC from UDP port 41234 to `ws://localhost:47100`, then click **Connect OSC** in the page.

```shell
npm run osc-bridge                     # UDP 41234 -> ws://localhost:47100
npm run osc-bridge -- --verbose        # also log every relayed message
npm run osc-bridge -- --udp-port 9000  # receive on another UDP port
```

Run `npm run osc-bridge -- --help` for all options (`--host`, `--udp-port`, `--ws-port`, `--reply-port`, `--verbose`).

**Pure Data:** `pd/osc-example.pd` (Pd vanilla 0.48+) connects to the bridge and sends notes, three sliders (`weight`, `amp`, the xy pad's x) and the ADSR on/off switch. The chain is `[oscformat rsw note]` → `[list prepend send]` → `[list trim]` → `[netsend -u -b]`, after a `[connect localhost 41234(` message to `[netsend -u -b]`. The patch connects to `localhost` when it opens; a second box connects to a WSL address instead (see below; edit it to the address the bridge prints). UDP has no handshake, so Pd's "connected" output only means the socket is open: the bridge's `--verbose` log shows whether messages arrive.

**Windows + WSL:** if the project runs in WSL and Pd on Windows, the page reaches the bridge (WSL forwards TCP on `localhost`), but Pd's UDP does not: WSL doesn't forward UDP from Windows' `localhost`, so Pd must send to WSL's IP. Start the bridge with `npm run osc-bridge -- --host 0.0.0.0`, which prints that IP (it can change after a reboot), and use the patch's WSL connect box. Two firewalls may block it, each needing a one-time rule for UDP 41234:

- Windows' Hyper-V firewall for WSL (blocks inbound by default on recent WSL), in PowerShell as Administrator:
  ```powershell
  New-NetFirewallHyperVRule -Name "WSL-OSC-Bridge" -DisplayName "WSL OSC bridge (UDP 41234)" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol UDP -LocalPorts 41234
  ```
- `ufw` inside WSL, if enabled (`sudo ufw status`):
  ```shell
  sudo ufw allow in on eth0 to any port 41234 proto udp comment 'OSC bridge from Windows'
  ```

WSL's mirrored networking (`networkingMode=mirrored`) also makes `localhost` work for UDP, but it can break other tools such as VS Code's WSL remote.

- **Presets**: **Save preset** downloads the current values as `<slug>-preset.json` (e.g. `rspline-preset.json`); **Load preset** reads such a file back.

### Components
These options work on several components:

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| midictrl | number | MIDI CC number (0-127) that controls the widget, scaled into its `min`..`max` (fader, knob, spinner) | no |
| tooltip | string | text shown when hovering the label (fader, knob, spinner, select, xy) | no |

The label tooltip also lists the widget's MIDI CC and OSC address, e.g. `ctrl:7 osc:/rsw/amp`.

The following components are currently available.

#### panel

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'panel' | yes |
| id | string | the id of the panel | yes |
| label | string | the title displayed above the panel | no |
| on | boolean | if true, the title gets an on/off switch which sends 1 or 0 on the channel `<id>`; can be used to turn a complete unit on and off | no |
| defval | boolean | the initial state of the `on` switch (default off) | no |
| widgets | list | the list of components in the panel | yes |
| vertical | boolean | the orientation of the components inside the panel (default false: horizontal) | no |
| wrap | boolean | let the components wrap onto several lines (default false) | no |

#### tabpanel

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'tabpanel' | yes |
| id | string | the id of the tab panel | yes |
| widgets | list | a list of panels; each one becomes a tab titled with its `label`; the first tab is shown first | yes |

#### fader, knob
The faders and knobs support editing values and stepping with the keyboard up and down arrows.
The values sent to Csound are rounded to `step`.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'fader' or 'knob' | yes |
| id | string | the id of the fader/knob corresponding to the Csound channel name | yes |
| label | string | the label displayed above the fader/knob | no |
| min | number | the minimum value | yes |
| max | number | the maximum value | yes |
| step | number | the precision - use 1 for integer and e.g. 0.01 for floats | yes |
| defval | number | the default value | yes |
| unit | string | a unit shown after the value, e.g. `"s"` or `"Hz"` | no |
| height | number | the height of the fader (default 256) or knob (default 50) | no |
| width | number | the width of the knob (default 50) | no |
| log | boolean | logarithmic scale (`min` must be > 0) | no |
| size | number | the width of the fader's value box in characters (default 2) | no |
| digits | number | the number of characters of the knob's value | no |

#### multifader
A row of `count` faders sharing one range; fader `k` (from `start`) uses the channel `<id>-<k>` and is labelled `k`.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'multifader' | yes |
| id | string | the base id; the channels are `<id>-<start>` … `<id>-<start+count-1>` | yes |
| label | string | the title displayed above the faders | no |
| start | number | the number of the first fader | yes |
| count | number | how many faders | yes |
| min | number | the minimum value | yes |
| max | number | the maximum value | yes |
| step | number | the precision | yes |
| defval | number or list | the default value of all faders, or one value per fader | yes |
| unit | string | a unit shown after the values | no |
| height | number | the height of the faders | no |

#### spinner
A number input with up and down arrows.
The arrows (hold to repeat) and the keyboard up/down keys change the value immediately; a typed value is sent when you press Enter or leave the field, rounded to `step` and clamped to `min`/`max`.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'spinner' | yes |
| id | string | the id of the number input corresponding to the Csound channel name | yes |
| label | string | the label displayed above the spinner | no |
| min | number | the minimum value (no lower limit if missing) | no |
| max | number | the maximum value (no upper limit if missing) | no |
| step | number | the precision - use 1 for integer and e.g. 0.01 for floats (default 1) | no |
| defval | number | the default value | yes |
| size | number | the width of the field in characters | no |
| unit | string | a unit shown after the value, e.g. `"Hz"` | no |

#### xy
A pad with a draggable dot; it sends two channels. `y` grows downwards (top = `minY`). Values are rounded to 3 decimals.
The x and y labels' tooltips show each axis' OSC address, e.g. `osc:/rsw/xy/num1`.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'xy' | yes |
| id | string | the id of the xy component | yes |
| idx | string | the id of the x value corresponding to the Csound channel name | yes |
| idy | string | the id of the y value corresponding to the Csound channel name | yes |
| minX | number | the minimum value of x | yes |
| maxX | number | the maximum value of x | yes |
| minY | number | the minimum value of y | yes |
| maxY | number | the maximum value of y | yes |
| defval | object | the default value of the form `{[idx]: defaultx, [idy]: defaulty}` | yes |
| height | number | the size of the pad in pixels | yes |
| sum | boolean | keep the dot in the top-left half of the pad, so that x and y together never exceed the range (the pad's diagonal from bottom-left to top-right is the limit) | no |

#### select
A radio button selection; it sends the `value` of the chosen item.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'select' | yes |
| id | string | the id of the selection corresponding to the Csound channel name | yes |
| label | string | the label displayed above the selection | no |
| items | list | the items, each of the form `{ name: "sin", value: 0 }` | yes |
| defval | number | the `value` selected at start | no |
| vertical | boolean | arrangement of the buttons (default false) | no |

#### toggle
A button that switches between on and off; it sends true/false on the channel `<id>`.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'toggle' | yes |
| id | string | the id of the toggle corresponding to the Csound channel name | yes |
| label | string | the text of the button | yes |

#### adsr (component) and Components.adsr (panel)
`Components.adsr(id, height)` returns a ready-made panel with four faders (`<id>_a`, `<id>_d`, `<id>_s`, `<id>_r`, in seconds except S) and an on/off switch on `<id>`, as used in `src/patches/rspline.js`.
The `adsr` component type shows the same four values as knobs with a curve:

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'adsr' | yes |
| id | string | the base id; the channels are `<id>_a`, `<id>_d`, `<id>_s`, `<id>_r` | yes |
| label | string | the title of the component | no |
| on | boolean | adds an on/off switch which sends 1 or 0 on `<id>` | no |

`Components.lfo(id, label, amp)` returns a panel with rate (`<id>_rte`, Hz), amplitude (`<id>_amp`), phase (`<id>_phs`) and wave type (`<id>_type`) controls and an on/off switch on `<id>_on`.

#### scope
A display of what Csound outputs: the waveform, or (with the **spectrum** button) its spectrum on a logarithmic frequency axis from 20 Hz. It reads Csound's output node through a Web Audio `AnalyserNode`, so the `.csd` needs nothing; it has no channel and sends nothing, so presets, MIDI CC and OSC ignore it.

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'scope' | yes |
| id | string | a unique id (not a Csound channel) | yes |
| label | string | the title shown above the display | no |
| mode | string | the initial view: 'wave' (default) or 'spectrum' | no |
| width | number | the width in pixels (default 300) | no |
| height | number | the height in pixels (default 120) | no |
| gain | number | scales the wave view, e.g. 4 for a quiet instrument; values beyond ±1 are clipped at the edges (default 1, the real level). The sound and the spectrum are unaffected | no |
| fftSize | number | analyser size, a power of 2 from 32 to 32768 (default 2048): the wave view shows half of it in samples, the spectrum's resolution grows with it | no |

#### more to come
combobox, string input, meter, ....

### Deploying
Run
```shell
npx gatsby clean && npm run build
```
If all worked fine, you can test the app with `npm run serve`.
The static web site is located in the `public` folder and can be deployed wherever you want.
If the web app is hosted under a subpath:

- in `gatsby-config.js` set `pathPrefix` to the target path on the web server,
- then run
```shell
npx gatsby clean && npm run build:pages
```
(`build:pages` is `gatsby build --prefix-paths`; test the result with `npm run serve:pages`.)

**GitHub Pages:** `.github/workflows/deploy.yml` builds with the prefix and publishes the site on every push to `feature/library_refactoring`, the default branch (or by hand from the Actions tab). GitHub serves a project site under the repository name, so `pathPrefix` is `/csound-web-gatsby-react-bootstrap-starter`: change it if you fork or rename the repository. One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. The site is then at `https://<user>.github.io/<repository>/`.

### Lowlevel
To be done.
The components are reusable. For apps e.g. without MIDI or with sequencers, take `src/components/lib/csoundinstr.js`
and modify it accordingly.

It is possible to plug in custom components by providing a generation function (see `src/components/lib/panel.js`):
a component of an unknown `type` with a `func(def, onChange)` gets rendered by that function.
Examples will be provided soonish.

### Design
`design/` holds the Figma files of the UI (`csound-web-ui.fig`, `csound-web-ui-v2.fig`) and `design/system/`, the design system generated from the code: colour, spacing and type tokens (`tokens.json`, mirroring `src/styles/_variables.scss`), usage guidelines (`README.md`) and a preview of each component.

## License
LGPL-3.0-or-later (see `LICENSE` and `COPYING`), except `src/components/lib/`, which keeps its own public-domain license (Unlicense).
