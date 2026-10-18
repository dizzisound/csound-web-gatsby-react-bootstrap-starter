import rspline from "./rspline"
import fm from "./fm"

// Every patch, in menu order. Each one also needs a page,
// src/pages/patch/<slug>.js (see rspline.js there).
const patches = [rspline, fm]

export const patchPath = patch => `/patch/${patch.slug}/`

export default patches
