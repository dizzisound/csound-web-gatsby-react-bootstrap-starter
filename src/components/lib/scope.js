import { useContext, useEffect, useRef, useState } from "react"
import { Row, Col } from "react-bootstrap"
import CsoundContext from "./csoundcontext"
import Label from "./label"
import Util from "./util"

const MIN_DB = -100
const MAX_DB = 0
const MIN_FREQ = 20

// A display widget: an oscilloscope (wave) or spectrum of Csound's output,
// read from a Web Audio AnalyserNode tapped off the output node. It sends
// nothing to Csound, so it has no value, defval or changeValue.
const Scope = ({ def }) => {
  const engine = useContext(CsoundContext)
  const canvas = useRef(null)
  const [mode, setMode] = useState(def.mode === "spectrum" ? "spectrum" : "wave")
  const modeRef = useRef(mode)
  modeRef.current = mode
  const width = def.width || 300
  const height = def.height || 120
  const fftSize = def.fftSize || 2048
  const gain = def.gain || 1 // wave view only: scales the trace, not the sound

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const dpr = window.devicePixelRatio || 1
    el.width = Math.round(width * dpr)
    el.height = Math.round(height * dpr)
    const ctx = el.getContext("2d")
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const colors = {
      bg: Util.cssColor("var(--cs-bg)", el),
      grid: Util.cssColor("var(--cs-surface-2)", el),
      trace: Util.cssColor("var(--cs-accent)", el),
    }
    const clear = () => {
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2 + 0.5)
      ctx.lineTo(width, height / 2 + 0.5)
      ctx.stroke()
    }
    clear()
    if (!engine) return

    const analyser = engine.audioContext.createAnalyser()
    analyser.fftSize = fftSize
    analyser.smoothingTimeConstant = 0.8
    engine.node.connect(analyser)
    const wave = new Float32Array(analyser.fftSize)
    const spectrum = new Float32Array(analyser.frequencyBinCount)
    const nyquist = engine.audioContext.sampleRate / 2

    const drawWave = () => {
      analyser.getFloatTimeDomainData(wave)
      // Start at a rising zero crossing so a steady tone stands still.
      const span = wave.length / 2
      let start = 0
      for (let i = 1; i < span; i++) {
        if (wave[i - 1] < 0 && wave[i] >= 0) { start = i; break }
      }
      ctx.beginPath()
      for (let x = 0; x < width; x++) {
        const v = Math.max(-1, Math.min(1, gain * wave[start + Math.floor((x / width) * span)]))
        const y = (1 - v) * height / 2
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    const drawSpectrum = () => {
      analyser.getFloatFrequencyData(spectrum)
      // Logarithmic frequency axis from MIN_FREQ to Nyquist.
      ctx.beginPath()
      for (let x = 0; x < width; x++) {
        const freq = MIN_FREQ * Math.pow(nyquist / MIN_FREQ, x / width)
        const bin = Math.min(spectrum.length - 1, Math.round((freq / nyquist) * spectrum.length))
        const db = Math.max(MIN_DB, Math.min(MAX_DB, spectrum[bin]))
        const y = height - ((db - MIN_DB) / (MAX_DB - MIN_DB)) * height
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    let frame
    const draw = () => {
      frame = requestAnimationFrame(draw)
      clear()
      ctx.strokeStyle = colors.trace
      ctx.lineWidth = 1.5
      modeRef.current === "spectrum" ? drawSpectrum() : drawWave()
    }
    draw()

    return () => {
      cancelAnimationFrame(frame)
      try {
        engine.node.disconnect(analyser)
      } catch (e) {
        // already disconnected (e.g. Csound was destroyed first)
      }
    }
  }, [engine, width, height, fftSize, gain])

  return (
    <Col md="auto" style={{ width: width + 2 }}>
      <Row className="g-0 scopehead">
        <Label label={def.label} tooltip={def.tooltipBase} />
        <Col className="scopemodes">
          {["wave", "spectrum"].map(m => (
            <button key={m} type="button"
                    className={"btn btn-sm " + (mode === m ? "btn-primary" : "btn-secondary")}
                    onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </Col>
      </Row>
      <Row className="g-0">
        <Col className="scope">
          <canvas ref={canvas} style={{ width, height, display: "block" }}
                  title={engine ? "" : "Waiting for Csound"} />
        </Col>
      </Row>
    </Col>
  )
}

export default Scope
