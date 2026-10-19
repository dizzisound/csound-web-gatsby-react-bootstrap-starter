Csound Web UI is the look of browser-based Csound instruments built with the Gatsby / React / react-bootstrap starter: a dark navy console where yellow names the controls and blue marks what is active. An instrument page is a status bar, a row of panels full of faders, knobs and spinners, preset buttons and a computer-keyboard footer.

## Voice and copy

- Write UI text in English, sentence case for actions and states: "Save preset", "Connect OSC", "Start audio", "MIDI unavailable".
- Write widget labels and panel titles lowercase in the instrument definition (`steps`, `seed`, `wave 0`, `adsr`); panel and footer titles are uppercased by CSS, widget labels stay as written.
- Use single letters for envelope stages (`A`, `D`, `S`, `R`) and short abbreviations musicians know (`WGT`, `amp`, `rte`, `phs`).
- Put a space between a value and its unit: `0.1 s`, `2000 Hz`.
- Name ongoing states with the typographic ellipsis: "Csound loading…", "Connecting OSC…".
- Say what failed and what to do in one phrase: "No OSC bridge - retry". Put detail in the `title` tooltip, not the label.
- No emoji. The only glyphs are ▶ on Start audio and ▲ ▼ on spinner buttons.

## Colour

- Build every screen on `cs-bg`; panels are `cs-surface`; anything raised (title bands, footer, buttons, badges, dropdowns) is `cs-surface-2`; hover and pressed is `cs-surface-3`.
- Set text in `cs-text`; titles, units and ticks in `cs-text-muted`; numeric read-outs in `white`.
- Use `cs-accent` (yellow) for widget labels, the xy dot, links and input focus. Never fill a large area with it.
- Use `cs-blue` for what is active or grabbed: fader handles, the knob's value arc, the checked select option, a switch that is on, primary buttons.
- Keep `cs-success`, `cs-warning` and `cs-danger` for status only (badge dots, the Start audio button, pending input) and always pair them with words.
- Draw every border 1px (`border-width`) in `cs-border`.
- Reference the palette as `var(--cs-*)` in CSS and canvas code (canvas widgets read it through `Util.cssColor`), and as `$cs-*` in Sass. The Bootstrap names (`primary`, `secondary`, `body-bg`, …) are aliases of the palette; don't give them other values.
- Contrast to know about: `cs-text-muted` on `cs-surface-2` (panel titles) is 4.40:1, borders are 1.4–2.5:1, and `cs-blue` handles on `cs-surface` are 2.6:1. These are the shipped values.

## Type

- Use the system font stack (`sans`, Bootstrap's default): Segoe UI on Windows, San Francisco on Apple, Roboto on Android. There are no font files.
- Page: `h2` for the instrument name, `site-brand` above it.
- Panels: `panel-title` (0.78rem, 600, 0.08em tracking, uppercase) and `subpanel-title` for nested panels.
- Widgets: `widget-label` above every control, `value` for read-outs with tabular figures, `knob-value` inside knobs, `unit` after a knob's label in brackets, `tick` under hfaders.
- Controls: `button-sm`, `badge`.

## Space and shape

- Use the 4px scale: `space-1` inside a widget column, `space-2` inside a panel, `space-3` between panels and around the footer, `space-4` / `space-5` for the page's top and bottom.
- Give widget columns a 3.5rem minimum width and centre them in their panel; panels take the width their content needs, then share the row.
- Round panels, footer, dropdowns and tabs with `radius`; small buttons and the select group with `radius-btn-sm`; wells (value boxes, spinner, rails, xy pad) with `radius-input`; badges with `radius-pill`.
- Shadows only on slider handles (`handle-shadow`) and the ok badge dot (`status-glow`). Elevation otherwise comes from the surface steps.

## Layout of an instrument

The page frame (`.page-frame`, `layout.js`) fits its content and is centered; on large screens (Bootstrap `lg` and up) it is at least 960px and at most 1720px wide, never wider than the window. The site header sits at the frame's left edge; an instrument's title is centered above it.

1. Status bar (`insthead`): Csound badge, Start audio or the Audio badge, MIDI device and channel dropdowns (or the MIDI badge), the OSC button, and the tuning dropdown pushed to the right. Columns are 24px apart.
2. Panels (`inst`), `space-3` apart, all the same height.
3. Preset buttons (`insttools`): Save preset, Load preset.
4. Footer (`instfooter`): COMPUTER KEYBOARD title, Velocity and Octave hfaders, Screen keyboard pushed to the right.

The instrument root takes keyboard focus for computer-keyboard notes; its focus frame is a 1px `cs-accent` outline at 35%.

## Icons

- Inline SVG on a 16-unit grid drawn at 14px, 1.5 stroke, round caps and joins, `stroke="currentColor"` so they follow the button text. The three icons are in the Icons assets.
- Icons appear only inside secondary buttons, before the label. Don't add icon-only buttons.

## Building a widget

- Every widget `id` is a Csound channel read with `chnget`; the widget sets `def.changeValue` and calls `onChange(id, value)` so defaults, presets, MIDI CC and OSC reach it.
- Display widgets (the scope) are the exception: they only read Csound's output and send nothing. Draw them as a `cs-bg` well with a `cs-border` outline like the XY pad, the trace in `cs-accent` and guides in `cs-surface-2`.
- Style new widgets from the tokens above; keep global CSS in `src/styles` and pure ASCII.

## Using the components

- Load React 18 or newer as the globals `window.React` / `window.ReactDOM` (from a `<script>` tag that means React 18: React 19 publishes no such browser build), then `tokens.css`, `components/bundle.css` and `components/bundle.js`; the components are on `window.CsoundWebUI`. The app itself runs on React 19.
- Every control works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`, with `onChange` to listen). Pass `onChange` straight to the Csound channel the widget stands for, as `CsoundInstr.handleUpdate(id, value)` does; XYPad sends `{x, y}`, to fan out on its two channels.
- Compose an instrument as the code does: `Panel` per sound unit, `SubPanel` for repeated blocks, widgets inside. Use `Panel switchable` for units with an on/off channel.
- These components reproduce the look and interaction of `src/components/lib` for design and prototyping; the instrument itself still renders with the library in the repository.
