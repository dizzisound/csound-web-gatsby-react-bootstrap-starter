import React from "react"

// Engine access for display widgets (e.g. the scope), provided by CsoundInstr
// once Csound is running: { csound, audioContext, node }, where `node` is
// Csound's output AudioNode. null while Csound is loading or failed to start.
const CsoundContext = React.createContext(null)

export default CsoundContext
