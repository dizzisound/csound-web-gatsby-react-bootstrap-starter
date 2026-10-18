import PatchPage, { PatchHead } from "../../components/patchpage"
import fm from "../../patches/fm"

const FmPage = () => <PatchPage patch={fm} />

export const Head = () => <PatchHead patch={fm} />

export default FmPage
