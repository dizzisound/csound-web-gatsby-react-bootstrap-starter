import PropTypes from 'prop-types'
import { useStaticQuery, graphql } from 'gatsby'
import { Container, Row, Col } from "react-bootstrap";
import Header from './header'

const Layout = ({ children,pageInfo }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <>
      <Container fluid className="page">
        <Row>
          <Col></Col>
          <Col md="auto">
            <Row>
              <Header siteTitle={data.site.siteMetadata.title} />
            </Row>
            <Row className="justify-content-md-center">
              {children}
            </Row>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
