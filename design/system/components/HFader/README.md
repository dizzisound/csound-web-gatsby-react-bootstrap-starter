# HFader
A horizontal slider with tick marks and labels, used for velocity and octave in the computer-keyboard footer.

**Source:** `lib/hfader.js` + `lib/hslidercomponents.js`.

## Props
`min`, `max`, `step`, `defval`, `vals` (tick values), `onChange(value)`. It is driven by props, not by a definition object.

## Usage
- 120px wide; rail 14px, `cs-bg`, `cs-border`, `radius-track`; handle 10 × 24 `cs-blue` with `handle-border` and `handle-shadow`.
- Ticks: 1 × 5 `cs-text-muted`; labels in `tick` (11px) `cs-text`, centred under each tick.
- In the footer each sits in a column of `flex: 1 1 8rem; max-width: 12rem`.
