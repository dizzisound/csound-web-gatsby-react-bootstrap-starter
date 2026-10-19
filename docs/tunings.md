# Tunings

The tuning menu in the status bar (top right) decides which pitch each key plays, for the computer keyboard, MIDI, OSC notes and the screen keyboard's **12edo** tab. Each instrument can bring its own tunings; Random Spline Waves has the four below, the FM Synth only 12edo.

## The tunings

**12edo** ("12 equal divisions of the octave") is standard equal temperament, as on a piano: the octave split into 12 equal semitones. It is always first in the menu.

The others are **just intonation** (JI): each note is a whole-number frequency ratio to the scale's first note, like 3/2 (a pure fifth) or 5/4 (a pure major third), instead of a step of an equal division. Pure ratios sound smoother and more "locked in" than equal-tempered intervals, at the cost of some keys sounding better than others.

| Name | Ratios (C to B) | What it is |
|---|---|---|
| **blue** | 1, 21/20, 10/9, 7/6, 5/4, 21/16, 7/5, 3/2, 25/16, 5/3, 7/4, 15/8 | a 12-note 7-limit JI scale: it uses the "septimal" ratios with a 7, such as 7/6 (a minor third) and 7/4 (a minor seventh), a little flatter than their equal-tempered versions; the bluesy intervals of the name |
| **overtone** | 16/16, 17/16, 18/16 (9/8), 19/16, 20/16 (5/4), 21/16, 22/16 (11/8), 24/16 (3/2), 26/16 (13/8), 27/16, 28/16 (7/4), 30/16 (15/8) | the harmonic series: harmonics 16 to 30 of a low fundamental, folded into one octave |
| **monte** | 1, 64/63, 9/8, 8/7, 7/6, 4/3, 21/16, 3/2, 32/21, 14/9, 16/9, 7/4 | another 7-limit JI scale, built from a different starting key (see `basekey` below); the name is probably a nod to La Monte Young, known for 7-limit just intonation, though these are not his exact ratios |

## How a tuning maps keys to pitches

A tuning is defined in the instrument's file (`tunings` in `src/patches/<instrument>.js`) by three values:

- `scale`: the 12 ratios of one octave;
- `basefreq`: the frequency, in Hz, of the lowest key (MIDI key 0) when `basekey` is 0;
- `basekey`: shifts which key gets which ratio.

The pitch of MIDI key `k` is

```
basefreq × scale[(k + basekey) mod 12] × 2 ^ floor((k + basekey) / 12)
```

With the values used here, middle C (key 60) is 264 Hz in **blue** and **overtone** (the classic just C, a little above 12edo's 261.6 Hz), and A (key 69) is exactly 440 Hz in **blue** and **monte**; in **monte**, middle C is about 260.7 Hz.

To add a tuning to an instrument, add an object `{ name, basekey, basefreq, scale }` to its `tunings` list.

## Notes

- In 12edo, notes go to the orchestra as MIDI key numbers (its `trig` instrument); in every other tuning, as frequencies (its `freqtrig` instrument).
- Changing the tuning while notes are held is safe: each note stops with the pitch it started with.
