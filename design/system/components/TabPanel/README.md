# TabPanel
Bootstrap tabs, one tab per child panel; use it when panels share the same controls and only one is edited at a time.

**Source:** `lib/tabpanel.js` (react-bootstrap `Tabs`, restyled by the nav-tabs variables in `_variables.scss`).

## Usage
- `type: "tabpanel"`, `widgets`: panels only; each panel's `label` becomes its tab title.
- Active tab: `cs-surface` with `cs-border` sides and `cs-text`; other tabs show `link-color` (`cs-accent`).
- `tab-padding-y` / `tab-padding-x`, `radius` on the top corners, `space-4` under the tab row.
