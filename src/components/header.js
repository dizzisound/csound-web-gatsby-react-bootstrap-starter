import { Col } from "react-bootstrap";
import { Link } from "gatsby";

// Replace the site title with your logo if you like.
const Header = ({ siteTitle }) => (
  <Col>
    <Link to="/" className="site-brand">{siteTitle}</Link>
  </Col>
)

export default Header
