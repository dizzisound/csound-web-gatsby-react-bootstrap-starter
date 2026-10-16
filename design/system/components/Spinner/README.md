# Spinner
A number field with up/down buttons, arrow-key stepping and press-and-hold repeat.

**Source:** `lib/spinner.js` (`NumericFormat` wrapper replacing react-numeric-input).

## Usage
- Field: `value` style in `white` on `cs-bg`, `cs-border`, left corners `radius-input`, `input-padding-y` / `input-padding-x`.
- Buttons: `cs-surface-2`, glyphs in `spinner-arrow` `cs-text-muted`, hover `cs-surface-3` / `cs-text`.
- Typed text that is not yet committed shows italic `cs-danger` (`spinner-pending`) until Enter or blur; values clamp to `min`/`max` and round to `step`.
