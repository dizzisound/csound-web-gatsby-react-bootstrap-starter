import { Row, Col } from "react-bootstrap"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import patches, { patchPath } from "../patches"

// Home: the list of instruments (src/patches/index.js).
const IndexPage = () => (
  <Layout>
    <Col>
      <Row>
        <Col><h2>Instruments</h2></Col>
      </Row>
      <Row className="g-3">
        {patches.map(patch => (
          <Col key={patch.slug} xs="auto">
            <Link to={patchPath(patch)} className="patchcard">
              <span className="patchcard-title">{patch.title}</span>
              <span className="patchcard-desc">{patch.description}</span>
            </Link>
          </Col>
        ))}
      </Row>
    </Col>
  </Layout>
)

export const Head = () => <Seo />

export default IndexPage
