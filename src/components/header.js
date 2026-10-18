import { Col } from "react-bootstrap";
import { Link } from "gatsby";
import patches, { patchPath } from "../patches";

// Replace the site title with your logo if you like.
const Header = ({ siteTitle }) => (
  <Col className="site-header">
    <Link to="/" className="site-brand">{siteTitle}</Link>
    <nav className="site-nav" aria-label="Instruments">
      {patches.map(patch => (
        <Link key={patch.slug} to={patchPath(patch)} activeClassName="active">{patch.title}</Link>
      ))}
    </nav>
  </Col>
)

export default Header
