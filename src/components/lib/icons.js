// Small inline SVG icons (no icon-font dependency); they follow the text colour.
const Svg = ({ children }) => (
  <svg className="btn-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

// download arrow into a tray
export const SaveIcon = () => (
  <Svg><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 11v2.5h11V11" /></Svg>
)

// open folder
export const LoadIcon = () => (
  <Svg><path d="M1.5 4.5v8h11l2-6h-11l-2 6M1.5 4.5v-1.5h4l1.5 1.5h5.5v2" /></Svg>
)

export const KeyboardIcon = () => (
  <Svg><rect x="1.5" y="4" width="13" height="8" rx="1.5" /><path d="M4 6.5h1M7.5 6.5h1M11 6.5h1M5 9.5h6" /></Svg>
)
