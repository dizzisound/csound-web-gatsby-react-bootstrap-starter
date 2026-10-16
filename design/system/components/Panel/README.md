# Panel
A titled container that groups the widgets of one sound unit; panels can nest.

**Source:** `lib/panel.js` (classes `patcol`, `patlabel`, `patbody`, `patvertical` in `_cs.scss`).

## Definition
| option | meaning |
| --- | --- |
| `type` | `"panel"` (or `"multifader"`, a row of generated faders) |
| `id` | Panel id; with `on: true` it is also the Csound channel that receives 1/0 |
| `label` | Title shown in the band. Omit it for an untitled panel (`md="auto"` column) |
| `widgets` | The children, any widget or panel |
| `vertical` | Stack the children in a column (`patvertical`) instead of a row |
| `wrap` | Let a horizontal body wrap |
| `on` | Show a **PanelSwitch** in the title |

## Usage
- Title band: `cs-surface-2` on a `cs-surface` body, `radius` on top; title in `panel-title`, uppercase, `cs-text-muted`.
- Body: `space-2` side padding and gap, `space-3` bottom padding; top-level panels sit `space-3` apart and share the row (`flex: 1 1 auto`).
- A panel nested in another becomes a **SubPanel**.
- Keep labels short and lowercase in the definition; CSS uppercases them.
