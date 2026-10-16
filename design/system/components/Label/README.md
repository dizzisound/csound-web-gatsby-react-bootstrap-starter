# Label
The yellow caption above every widget, with an optional tooltip.

**Source:** `lib/label.js` (`.dbyellow .widget-label`).

## Usage
- `widget-label` style (0.85rem, 500) in `cs-accent`.
- The tooltip is built by `Instrument` from `tooltip`, `midictrl` and the OSC path (`ctrl:7 osc:/rsw/amp`) and shows after 250 ms on `tooltip-bg`.
- Write labels lowercase and short (`steps`, `seed`, `amp`); single letters for ADSR stages.
