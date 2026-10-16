# StatusBadge
A pill that reports engine, audio and MIDI state in the status bar.

**Source:** `StatusBadge` in `lib/csoundinstr.js` (`.status-badge`, `.status-dot`).

## Levels
| level | dot | use |
| --- | --- | --- |
| `ok` | `cs-success` with `status-glow` | Csound running, Audio running |
| `warn` | `cs-warning` | Csound loading… |
| `err` | `cs-danger`, border `cs-danger` | Csound error (detail in `title`) |
| `muted` | `cs-text-muted`, text muted | MIDI unavailable |

## Usage
- `badge` style, `cs-surface-2` fill, `cs-border` outline, `radius-pill`, `badge-padding-y` / `badge-padding-x`, `badge-gap`.
- Always pair the colour with words: the error red is only 2:1 on its fill.
- Use the typographic ellipsis (`…`) for ongoing states.
