# Dropdown
A react-select menu for tuning, MIDI input and MIDI channel in the status bar.

**Source:** `react-select` with `className="tunselect"` and `classNamePrefix="cs-select"` in `lib/csoundinstr.js`.

## Usage
- Control: min-height 31px, `cs-surface-2`, `cs-border` (hover `cs-text-muted`, focus `cs-accent`), `radius`.
- Value in `body` style `cs-text`; separator `cs-border`; chevron `cs-text-muted`.
- Menu: `cs-surface-2` with `cs-border`; focused option `cs-surface-3`; selected option `cs-blue` with `white` text.
- The tuning dropdown sits at the right end of the status bar with `min-width: 10rem`; not searchable, not clearable.
