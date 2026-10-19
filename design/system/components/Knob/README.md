# Knob
A rotary control drawn on a canvas, with the value in its centre.

**Source:** `lib/knob.js` + `lib/basicknob.js` (a jQuery-Knob port).

## Definition
`id`, `label`, `min`, `max`, `step`, `defval`, `width` / `height` (default 50), `digits`, `unit`, `log`, `midictrl`.

## Usage
- 300° arc starting at 210° (7 o'clock), stroke 35% of the radius; track `cs-surface-3`, value `cs-blue`.
- Value in `knob-value` (canvas font = width / digits) in `cs-text`, weight 600.
- A `unit` follows the label in brackets, in the `unit` style: `rte (Hz)`.
- Jumps of more than a fifth of the arc are ignored, so drags don't wrap around (measured on the log scale for `log` knobs).
- With `log`, the arc maps logarithmically; values still round to `step`, and arrow keys / the wheel move by 1/100 of the log range (at least one `step`).
