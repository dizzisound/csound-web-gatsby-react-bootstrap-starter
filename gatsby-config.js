module.exports = {
  // GitHub Pages serves the site under the repository name; applied only by
  // builds with --prefix-paths (npm run build:pages), so must match the repo name.
  pathPrefix: "/csound-web-gatsby-react-bootstrap-starter",
  // modern JSX transform (react/jsx-runtime); Gatsby 5 defaults to "classic",
  // which React 19 flags in development as an outdated JSX transform
  jsxRuntime: "automatic",
  siteMetadata: {
    title: `Random Spline Waves | Web Csound Instrument`,
    description: `a web-csound instrument for sound generation`,
    siteUrl: `https://dizzisound.github.io`
  },
  flags: {
    DEV_SSR: false
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        sassOptions: {
          includePaths: [`node_modules`],
          // Bootstrap 5's SCSS uses @import and global functions deprecated in
          // Dart Sass; hide warnings from dependencies until Bootstrap 6.
          // Deprecations in this project's own .scss files still show.
          quietDeps: true,
          // sass-loader 10 (pinned by gatsby-plugin-sass) uses the legacy JS API
          silenceDeprecations: [`legacy-js-api`],
          // no @charset rule or BOM in Sass's output (see postCssPlugins below)
          charset: false,
        },
        // Keep the CSS pure ASCII. Bootstrap's blockquote rule contains "—" and a
        // non-breaking space; with non-ASCII output Sass prepends a BOM, and
        // Gatsby inlines the CSS into a <style> tag in every page, where the BOM
        // breaks the first rule (Bootstrap's :root variables: fonts, colours).
        // Re-escape such characters (e.g. "\2014 ").
        postCssPlugins: [
          {
            postcssPlugin: `escape-non-ascii`,
            Declaration(decl) {
              decl.value = decl.value.replace(
                /[^\x00-\x7f]/g,
                c => `\\${c.codePointAt(0).toString(16)} `
              )
            },
          },
        ],
      },
    },
    "gatsby-plugin-image", 
    "gatsby-plugin-sitemap",
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        "icon": "src/images/icon.png"
      }
    },
    "gatsby-plugin-sharp", 
    "gatsby-transformer-sharp", 
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "images",
        "path": "./src/images/"
      },
      __key: "images"
    }
  ],
}