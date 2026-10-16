# XYPad
A square pad with a draggable dot that sends two channels at once.

**Source:** `lib/xy.js` (react-konva `Stage` inside `.xypad`).

## Definition
`id`, `idx`, `idy` (the two channels), `minX`, `maxX`, `minY`, `maxY`, `defval` (`{[idx]: x, [idy]: y}`), `height`, `tooltip`, `sum` (keep the dot in the top-left half, so x + y stays within the range; `y` grows downwards). Values are rounded to 3 decimals; there is no `step`.

## Usage
- Read-outs above: `x:` / `y:` in **Label** style, values in `value` style (`white`), starting from `defval`.
- The `x:` / `y:` tooltips show the definition's `tooltip` plus each axis' OSC address (`osc:/rsw/xy/num1`); over OSC each coordinate can be set on its own.
- Pad: `cs-bg` well, `cs-border`, `radius-input`, `height + 2` px square.
- Dot: 12px `cs-accent` with a 1px `cs-bg` outline; colours come from the CSS variables through `Util.cssColor`.
