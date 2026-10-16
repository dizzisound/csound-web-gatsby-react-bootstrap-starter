# NumberInput
A labelled **Spinner**: the widget behind `type: "spinner"`.

**Source:** `lib/numberinput.js`.

## Definition
`id`, `label`, `min`, `max`, `step`, `defval`, `size` (characters), `unit`.

## Usage
- Label above, spinner below, `space-1` apart, in a 3.5rem column.
- External values (MIDI CC, OSC, presets) are rounded to `step` and clamped like typed ones.
