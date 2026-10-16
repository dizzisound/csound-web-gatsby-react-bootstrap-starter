# csound-web-gatsby-react-bootstrap-starter
This starter can be used to quickly set up a csound-web (v 6.16.1) project developed with Gatsby 5, React 19 and react-bootstrap.
It ships with a small Csound instrument which generates sound with random spline waves.

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
You can use this starter without any deeper js/react knowhow. The GUI of a Csound instrument is made by filling out a JS object,
as shown in `src/pages/index.js`:

```jsx
import Layout from "../components/layout"
import Seo from "../components/seo"
import CsoundInstr from "../components/lib/csoundinstr"
import Components from "../components/lib/components"
import { Row, Col } from "react-bootstrap"
import { withPrefix } from "gatsby"

const IndexPage = () => {
  const inst = {
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
      Components.adsr("adsr1"),
      {
        type: "panel", label: "master", id: "master", widgets: [
          { id: "amp", type: "fader", label: "amp", min: 0, max: 1, step: 0.01, defval: 0.6, height: 200 },
          { id: "rev", type: "fader", label: "reverb", min: 0, max: 1, step: 0.01, defval: 0.6, height: 200 },
        ],
      },
    ],
  }
  const tunings = [
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
  ]

  return (
    <Layout>
      <Col>
        <Row>
          <Col><h2>Random Spline Waves</h2></Col>
        </Row>
        <Row>
          <Col>
            <CsoundInstr csoundwasm={withPrefix("csound.esm.js")}
                        inst={inst}
                        osc="rsw"
                        keyboard="rsw"
                        csd={withPrefix("rspline.csd")}
                        plugins={[]}
                        tunings={tunings} />
          </Col>
        </Row>
      </Col>
    </Layout>
  )
}

export const Head = () => <Seo />

export default IndexPage
```

The page's `<title>` and meta tags come from its `export const Head = () => <Seo />` (Gatsby Head API, see `src/components/seo.js`); pass `title="…"` for a per-page title.

The following rules apply:
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

### CsoundInstr

| prop | type | description | mandatory |
|------|------|-----------------------------|-------------|
| csoundwasm | string | URL of the Csound ESM bundle, e.g. `withPrefix("csound.esm.js")` | yes |
| csd | string | URL of the `.csd` file, e.g. `withPrefix("rspline.csd")` | yes |
| inst | object | the GUI definition: `{ components: [...] }` (see Components) | yes |
| tunings | array | extra tunings for the tuning menu; `12edo` is always first. Each is `{ name, basekey, basefreq, scale }`, with `scale` the 12 frequency ratios of an octave | yes (may be `[]`) |
| plugins | array | Csound plugins, passed to `Csound({ withPlugins })` | no |
| osc | string | OSC namespace (e.g. `"rsw"`); shows the **Connect OSC** button | no |
| keyboard | string | name of the `BroadcastChannel` shared with `src/pages/keyboard.js`; shows the **Screen keyboard** button | no |
| onStart | function | called once Csound is running | no |

### Playing and controlling the instrument
- **Computer keyboard**: click the instrument area first. Two rows play notes: `Z S X D C V G B H N J M , L .` (lower) and `Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P [ = ]` (upper); velocity and octave are set in the footer. Keys typed into a number field don't play notes.
- **Screen keyboard**: **Screen keyboard** opens `src/pages/keyboard.js` in a popup (12edo and just-intonation hexagon layouts, `.scl` files can be loaded).
- **MIDI** (Chrome, Edge, Opera; Firefox 108+ only with its site-permission add-on, or `dom.webmidi.gated` set to `false` in `about:config`): pick the input device and channel in the status bar. Devices plugged in after the page loaded appear automatically. A widget with a `midictrl` number follows that MIDI CC (scaled into its `min`..`max`).
- **OSC**: needs a bridge from UDP to WebSocket on `ws://localhost:47100` (see below); click **Connect OSC**. Addresses, with `rsw` being the `osc` namespace:

| address | arguments | effect |
|---|---|---|
| `/rsw/note` | on (1/0), MIDI key, velocity | play or stop a note (`trig`) |
| `/rsw/notefreq` | on (1/0), frequency in Hz, velocity | play or stop a note by frequency (`freqtrig`) |
| `/rsw/<widget id>` | value | set a widget, e.g. `/rsw/weight 0.75` |
| `/rsw/<panel id>` | 1 or 0 | switch an on/off panel |

The xy component takes one coordinate per message: `/rsw/xy/num1 0.5` (`/rsw/<id>/<idx or idy>`).

A minimal bridge with `osc-js` (already a dependency), relaying OSC from UDP port 41234 (e.g. Pure Data's `[netsend -u -b]` after `[oscformat]`) to the page:

```js
// osc-bridge.js — run with: node osc-bridge.js
const OSC = require("osc-js")

const osc = new OSC({
  plugin: new OSC.BridgePlugin({
    udpServer: { host: "127.0.0.1", port: 41234 }, // OSC senders send here
    udpClient: { host: "127.0.0.1", port: 41235 },
    wsServer: { host: "localhost", port: 47100 },  // the page connects here
  }),
})

osc.on("open", () => console.log("OSC bridge: UDP 41234 -> ws://localhost:47100"))
osc.open()
```

- **Presets**: **Save preset** downloads the current values as `file.json`; **Load preset** reads such a file back.

### Components
Every component accepts these options:

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| midictrl | number | MIDI CC number (0-127) that controls this widget | no |
| tooltip | string | text shown when hovering the label | no |

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
| size | number | the number of characters | yes |
| unit | string | a unit shown after the value, e.g. `"Hz"` | no |

#### xy
A pad with a draggable dot; it sends two channels. `y` grows downwards (top = `minY`). Values are rounded to 3 decimals.

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
`Components.adsr(id, height)` returns a ready-made panel with four faders (`<id>_a`, `<id>_d`, `<id>_s`, `<id>_r`, in seconds except S) and an on/off switch on `<id>`, as used in `src/pages/index.js`.
The `adsr` component type shows the same four values as knobs with a curve:

| parameter | type | description | mandatory |
|------|------|-----------------------------|-------------|
| type | string | must be 'adsr' | yes |
| id | string | the base id; the channels are `<id>_a`, `<id>_d`, `<id>_s`, `<id>_r` | yes |
| label | string | the title of the component | no |
| on | boolean | adds an on/off switch which sends 1 or 0 on `<id>` | no |

`Components.lfo(id, label, amp)` returns a panel with rate (`<id>_rte`, Hz), amplitude (`<id>_amp`), phase (`<id>_phs`) and wave type (`<id>_type`) controls and an on/off switch on `<id>_on`.

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
npx gatsby clean && npx gatsby build --prefix-paths
```

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
