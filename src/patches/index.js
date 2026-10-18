import rspline from "./rspline"

// Every patch, in menu order. Each one also needs a page,
// src/pages/patch/<slug>.js (see rspline.js there).
const patches = [rspline]

export const patchPath = patch => `/patch/${patch.slug}/`

export default patches
