# PanelSwitch
An on/off switch rendered in a panel title when the definition has `on: true`; it sends 1 or 0 on the panel's `id`.

**Source:** `lib/panelswitch.js` (`.patswitch`, `.patswitch-track`, `.patswitch-thumb`).

## Usage
- Track 28 × 16, `radius-switch`; off: `cs-bg` with a `cs-border` outline and a `cs-text-muted` thumb; on: `cs-blue` with a `white` thumb, label turns `cs-text`.
- It is a real `button` with `role="switch"` and `aria-checked`; focus shows a 2px `focus-ring` outline.
- Used by `Components.adsr()` and `Components.lfo()`.
