# Playing the instruments

Open an instrument from the home page or the header menu. If the status bar shows **▶ Start audio**, click it: browsers keep audio paused until you interact with the page.

## Without a MIDI keyboard: the computer keyboard

Click an empty part of the instrument (it shows a thin yellow frame when it has the focus), then play two rows of keys, like a piano:

| Row | Keys | Notes |
|---|---|---|
| lower | `Z S X D C V G B H N J M , L .` | middle C up to the D an octave above (S, D, G, H, J, L are the black keys) |
| upper | `Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P [ = ]` | from the C an octave higher, up an octave and a fifth to G (2, 3, 5, 6, 7, 9, 0, = are the black keys) |

- **Velocity** and **Octave** are set with the faders in the instrument's footer (octave 5, the default, puts `Z` on middle C).
- The **tuning menu** (top right) decides which pitches the keys play: see [Tunings](tunings.md).
- Keys typed into a number field don't play notes. If you move the focus away (a text field, another window or tab) while holding keys, their notes stop.

## The screen keyboard

**Screen keyboard** (footer, bottom right) opens a hexagonal keyboard in a popup, played with the mouse, by touch (several fingers on a touchscreen) or with the computer keyboard while the popup has the focus. It can play 31 and 53 notes per octave, which the instrument page's keys and MIDI can't. See [The screen keyboard](screen-keyboard.md).

## MIDI

In Chrome, Edge and Opera, a MIDI keyboard works as soon as it's plugged in: pick the input device and the channel in the status bar. Devices plugged in later appear by themselves. Firefox enables MIDI only with its site-permission add-on. Controls with a MIDI CC number (their tooltip shows `ctrl:<n>`) follow that controller.

## OSC

Programs such as Pure Data can play the instruments over OSC through a small bridge on your computer (`npm run osc-bridge`), then **Connect OSC** in the status bar. Addresses, the Pure Data example and the Windows + WSL setup are in the main [README](../README.md#playing-and-controlling-the-instrument).

## Panic

If a note keeps sounding (a MIDI cable pulled, an OSC sender stopped mid-note, the screen keyboard closed while a key was held), click **Panic** (the skull) in the status bar or press **Esc**: every note stops.

## Presets

**Save preset** downloads the current settings as `<instrument>-preset.json` (e.g. `rspline-preset.json`); **Load preset** reads such a file back.

## Seeing the sound

The **scope** shows the instrument's output: **wave** draws the waveform, **spectrum** its frequencies on a logarithmic scale from 20 Hz.
