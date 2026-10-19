# The screen keyboard

**Screen keyboard** (in an instrument's footer) opens a popup with a hexagonal keyboard: a **Terpstra keyboard**, the "isomorphic" layout behind the Lumatone. On an isomorphic keyboard every interval has the same shape wherever you play it, so a chord or scale fingering can be moved anywhere. It is played with the mouse, by touch (several fingers at once on a touchscreen), or with the computer keyboard (below); MIDI doesn't play it.

## The tabs

| Tab | Notes per octave | What it plays |
|---|---|---|
| **12edo** | 12 | MIDI note numbers, like the computer keyboard: the instrument's tuning menu and octave fader apply |
| **31jt** | 31 | Adriaan Fokker's 31-note 7-limit just intonation, laid out like 31-EDO, the classic 31-step equal division (close to quarter-comma meantone) |
| **53jt** | 53 | a 53-note just intonation; 53-EDO, its layout, approximates pure fifths (3/2) and thirds (5/4) extremely well |
| **12jt** | 12 | 12-note just intonation, the same ratios as the **blue** tuning |

"jt" stands for just tuning (just intonation): see [Tunings](tunings.md). The three jt tabs send frequencies directly, so they ignore the instrument's tuning menu and octave fader.

Going up a column, each key is one step higher (12edo: a semitone; 31jt: 2 of 31 steps; 53jt: 5 of 53 steps). Each hexagon shows its note: a name and octave on the 12edo tab, a ratio and octave on the jt tabs.

## Playing it with the computer keyboard

While the popup has the focus, the computer keyboard plays the visible tab: 46 hexagons show a key's letter above their note, and pressing that key plays them. The keyboard's rows are offset by half a key, like the hexagons, so neighbouring keys play neighbouring hexagons:

| Move on the keyboard | Move on the grid | 12edo | 31jt | 53jt |
|---|---|---|---|---|
| next key in the row (Z → X) | down-right | +2 semitones (a whole tone) | +3 steps | +4 steps |
| key above-left (Z → A, A → Q) | up | +1 | +2 | +5 |
| key above-right (Z → S) | up-right | +3 | +5 (the 9/8 whole tone) | +9 (9/8) |

Because the layout is isomorphic, a chord has the same shape everywhere on a tab. From any key:

| Tab | Major triad | Minor triad |
|---|---|---|
| 12edo | `Z C F` (C E G) | `Z S F` (C E♭ G) |
| 31jt | `Z E 5` (1/1 5/4 3/2) | (Fokker's scale has no 6/5) |
| 53jt | `Z F 5` (1/1 5/4 3/2) | `Z W 5` (1/1 6/5 3/2) |
| 12jt | `Z C F` (1/1 5/4 3/2) | `Z S F` (1/1 7/6 3/2, the septimal minor of the blue scale) |

- `Z` starts on middle C on the 12edo tab (as on the instrument page) and, on the jt tabs, on the 1/1 one octave above the lowest key (C2, 65.4 Hz, with the default base frequency). Raise the **Base frequency** to play higher: doubling it moves everything up an octave.
- The **arrow keys** slide the lettered area over the grid: ↑ ↓ by one hexagon, → ← by one down-right step.
- **Esc** stops every note (like **All Off**). With **hold** on, a key press starts a note and a second press stops it.
- The keys follow their position, not their letter, so they work the same on QWERTY, QWERTZ or AZERTY keyboards; the hexagons show the US letters.
- Keys typed into the base-frequency field don't play notes.

## Controls

- **hold**: when on, a click (or key press) starts a note and a second one stops it, so you can build chords with the mouse.
- **All Off**: stops every note the screen keyboard started.
- On the jt tabs only:
  - **Velocity**: how hard the notes are played (0 to 127).
  - **Base frequency**: the pitch of the lowest key (the 1/1 at the bottom left), 32.703 Hz by default (C1); from 1 to 256 Hz.
  - **Open SCL**: loads a scale in the [Scala](https://www.huygens-fokker.org/scala/scl_format.html) `.scl` format, replacing the tab's ratios.

## Loading Scala files

A `.scl` file has a description line, the number of notes, then one pitch per line (lines starting with `!` are comments). The screen keyboard accepts a file when:

- the number of notes matches the tab: 31 for 31jt, 53 for 53jt, 12 for 12jt;
- the pitches are ratios (`9/8`); pitches in cents (`203.9`) are not supported.

The last pitch of a Scala file is normally the octave (2/1); the keyboard uses the first note (1/1) plus the pitches before it. The file's description replaces the tab's.

## Good to know

- The popup talks to the instrument page in the same browser, so keep the instrument page open. If you switch instrument, the open popup plays the new one.
- If you close the popup while holding a note, use **Panic** (or Esc) on the instrument page.
