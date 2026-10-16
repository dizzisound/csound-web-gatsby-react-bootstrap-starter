# Button
Bootstrap small buttons in three roles, optionally with a 14px icon.

**Source:** react-bootstrap `Button size="sm"`, restyled in `_cs.scss`; icons from `lib/icons.js`.

## Variants
| variant | use | colours |
| --- | --- | --- |
| `secondary` | every ordinary action: presets, Connect OSC, Screen keyboard | `cs-surface-2`, `cs-border`, `cs-text`; hover `cs-surface-3`, border `cs-text-muted`, text `white` |
| `primary` | an active state (OSC connected), Toggle on | `cs-blue`, `white` |
| `warning` | the one call to action the browser requires: Start audio | `cs-warning`, `on-warning` |

## Usage
- `button-sm` text, `btn-sm-padding-y` / `btn-sm-padding-x`, `radius-btn-sm`.
- Icons are inline SVG that follow the text colour (see the Icons assets); `space-1` between icon and text.
- Labels are sentence case and say what happens: "Save preset", "Connect OSC", "No OSC bridge - retry".
- Toggle widgets (`type: "toggle"`) reuse this button: `primary` when on, `secondary` when off.
