# Design file

The tokens and components here mirror `design/csound-web-ui-v2.fig` in the repository (FigCraft). Its Variables use the same names and values (`cs/bg` there is `cs-bg` here; spacing and type are in px, with 16px = 1rem).

## Pages in the file

- **Components**: every widget bound to the Variables, with variants: Button (Primary, Secondary, Warning, optional icon), SelectOption (Default, Selected), StatusBadge (Ok, Warn, Error, Muted), PanelSwitch (Off, On), Fader (Value 0, 10, 50, 60, 100), HFader (Velocity, Octave), Icon (Save, Load, Keyboard); Panel and SubPanel take widgets in a "Content" slot.
- **Instrument V2**: the Random Spline Waves page as it runs (asset `instrument-v2.png`; compare `live-index.png`).
- **Instrument V1**: the first mock-up with invented panels, kept as an archive and detached from the components (asset `instrument-v1.png`).

## Where the file differs from the code

- Letter-spacing is in px (1px for 0.08em, 0.6px for 0.05em) because the design tool has no em unit.
- The panel title band is an inner shadow of the panel in `cs-surface-2`: auto-layout fill does not resize inside instances there.
- Fader handles can only sit at the five values of the Fader variants.
- In Instrument V2 the four panels have fixed widths (283, 418, 278 and 136px) measured from the live page.
