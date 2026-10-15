/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

// Page <head> content comes from each page's `export const Head` (see
// src/components/seo.js); the Head API can't set <html> attributes, so do it here.
exports.onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "en" })
}
