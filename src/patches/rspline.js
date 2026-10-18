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
