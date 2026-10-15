import { useStaticQuery, graphql } from "gatsby"

// Document head for a page, rendered from the page's `export const Head`
// (Gatsby Head API). `title` is an optional page title shown before the site
// title, separated by an en dash (the site title itself may contain "|").
const Seo = ({ title, children }) => {
  const { site } = useStaticQuery(graphql`
    query SeoQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)
  const { title: siteTitle, description } = site.siteMetadata
  return (
    <>
      <title>{title ? `${title} – ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="csound" />
      {children}
    </>
  )
}

export default Seo
