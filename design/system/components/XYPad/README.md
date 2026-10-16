# XYPad
A square pad with a draggable dot that sends two channels at once.

**Source:** `lib/xy.js` (react-konva `Stage` inside `.xypad`).

## Definition
`id`, `idx`, `idy` (the two channels), `minX`, `maxX`, `minY`, `maxY`, `step`, `defval` (`{[idx]: x, [idy]: y}`), `height`, `sum` (keep x + y inside the square's lower triangle).

## Usage
- Read-outs above: `x:` / `y:` in **Label** style, values in `value` style (`white`).
- Pad: `cs-bg` well, `cs-border`, `radius-input`, `height + 2` px square.
- Dot: 12px `cs-accent` with a 1px `cs-bg` outline; colours come from the CSS variables through `Util.cssColor`.
