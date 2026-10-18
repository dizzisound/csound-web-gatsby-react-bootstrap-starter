import Components from "../components/lib/components"

// The amplitude envelope: Components.adsr's faders with this patch's own
// defaults, and no on/off switch (the orchestra always applies it).
const envelope = () => {
  const panel = Components.adsr("fmenv", 160)
  const defaults = { fmenv_a: 0.01, fmenv_d: 0.3, fmenv_s: 0.6, fmenv_r: 0.3 }
  panel.widgets.forEach(fader => { fader.defval = defaults[fader.id] })
  return { ...panel, label: "envelope", on: false }
}

// FM Synth: two-operator FM (a sine modulating a sine), with a modulation
// index that decays like a struck sound. Orchestra: static/fm.csd.
const fm = {
  slug: "fm",
  title: "FM Synth",
  description: "Two-operator FM: ratio and index shape the timbre, the brightness envelope makes notes start bright and darken.",
  csd: "fm.csd", // a file in static/
  osc: "fm", // OSC namespace: /fm/note, /fm/<widgetId>, ...
  keyboard: true, // offer the screen keyboard popup
  inst: () => ({
    components: [
      {
        type: "panel", label: "operator", id: "operator", widgets: [
          { id: "fm_ratio", type: "knob", label: "ratio", min: 0.5, max: 8, step: 0.01, defval: 2,
            tooltip: "modulator frequency / carrier frequency: whole numbers sound harmonic, others bell-like" },
          { id: "fm_index", type: "knob", label: "index", min: 0, max: 12, step: 0.1, defval: 4,
            tooltip: "modulation depth: higher is brighter" },
        ],
      },
      {
        type: "panel", label: "brightness", id: "brightness", widgets: [
          { id: "fm_idecay", type: "knob", label: "decay", unit: "s", min: 0.01, max: 4, step: 0.01, defval: 0.8,
            tooltip: "time for the index to fall to its sustain level" },
          { id: "fm_isustain", type: "knob", label: "sustain", min: 0, max: 1, step: 0.01, defval: 0.3,
            tooltip: "index kept while the note is held, as a fraction of the index" },
        ],
      },
      envelope(),
      {
        type: "panel", label: "master", id: "master", widgets: [
          { id: "amp", type: "fader", label: "amp", min: 0, max: 1, step: 0.01, defval: 0.5, height: 160 },
          { id: "scope", type: "scope", label: "scope", width: 260, height: 150, gain: 2 },
        ],
      },
    ],
  }),
}

export default fm
