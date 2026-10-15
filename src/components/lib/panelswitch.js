// Panel title with an on/off switch, for panels whose definition has `on: true`
// (e.g. Components.adsr / Components.lfo): the panel's channel gets 1 or 0.
const PanelSwitch = ({ label, on, onClick }) => (
  <button type="button" className={"patswitch" + (on ? " on" : "")} role="switch" aria-checked={on}
          onClick={onClick}>
    <span className="patswitch-track"><span className="patswitch-thumb" /></span>
    <span className="patswitch-label">{label}</span>
  </button>
)

export default PanelSwitch
