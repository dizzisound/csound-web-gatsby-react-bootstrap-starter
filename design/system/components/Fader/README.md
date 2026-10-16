# Fader
A vertical slider with a label above and an editable ValueBox below.

**Source:** `lib/fader.js` + `lib/slidercomponents.js` (react-compound-slider).

## Definition
| option | meaning |
| --- | --- |
| `id` | Csound channel |
| `label`, `tooltip` | Caption (see **Label**) |
| `min`, `max`, `step`, `defval` | Range and default |
| `height` | Slider height in px (default 256; the example uses 200) |
| `log` | Logarithmic mapping between `min` and `max` |
| `unit`, `size` | Read-out suffix and width |
| `midictrl` | MIDI CC number mapped onto the range |

## Usage
- Rail: 10px wide `cs-bg` well with `cs-border`, `radius-input`. Handle: 24 × 10, `cs-blue`, `handle-border`, `handle-shadow`. No filled track.
- Column: min-width 3.5rem, `space-1` padding and gap.
- The handle at the extremes overhangs the rail by half its height, as in the code.
- Values sent to Csound are rounded to `step`, and each change is sent once (slider echoes are skipped).
