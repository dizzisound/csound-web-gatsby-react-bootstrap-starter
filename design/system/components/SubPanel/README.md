# SubPanel
A panel placed inside another panel's body, with a smaller title; use it to repeat one block of controls (wave 0…3).

**Source:** `lib/panel.js`, styled by `.patbody .patcol` / `.patbody .patlabel`.

## Usage
- Same definition as **Panel**; usually `vertical: true` so the controls stack (knob over spinner).
- Title in `subpanel-title` (0.75rem, 0.05em tracking); bottom padding `space-2` instead of `space-3`.
- The body background stays `cs-surface`, so only the title band marks the sub-panel.
