import { useMemo } from "react"
import { Row, Col } from "react-bootstrap"
import { withPrefix } from "gatsby"
import Layout from "./layout"
import Seo from "./seo"
import CsoundInstr from "./lib/csoundinstr"
import KEYBOARD_CHANNEL from "./keyboardchannel"

// The page of one patch (see src/patches/): its title and the instrument.
const PatchPage = ({ patch }) => {
  const inst = useMemo(() => patch.inst(), [patch])
  return (
    <Layout>
      <Col>
        <Row>
          <Col><h2 className="text-center">{patch.title}</h2></Col>
        </Row>
        <Row>
          <Col>
            <CsoundInstr key={patch.slug}
                         name={patch.slug}
                         csoundwasm={withPrefix("csound.esm.js")}
                         csd={withPrefix(patch.csd)}
                         inst={inst}
                         osc={patch.osc}
                         keyboard={patch.keyboard ? KEYBOARD_CHANNEL : undefined}
                         plugins={patch.plugins || []}
                         tunings={patch.tunings || []} />
          </Col>
        </Row>
      </Col>
    </Layout>
  )
}

export const PatchHead = ({ patch }) => <Seo title={patch.title} />

export default PatchPage
