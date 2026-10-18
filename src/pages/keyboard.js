import KeyboardLayout from "../components/lib/keyboardlayout";
import Seo from "../components/seo";
import KEYBOARD_CHANNEL from "../components/keyboardchannel";
function Keyboard() {
  return (
    <KeyboardLayout name={KEYBOARD_CHANNEL}/>
  )
}
export const Head = () => <Seo title="Keyboard" />

export default Keyboard
