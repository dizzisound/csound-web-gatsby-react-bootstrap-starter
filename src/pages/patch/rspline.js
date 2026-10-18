import PatchPage, { PatchHead } from "../../components/patchpage"
import rspline from "../../patches/rspline"

const RsplinePage = () => <PatchPage patch={rspline} />

export const Head = () => <PatchHead patch={rspline} />

export default RsplinePage
