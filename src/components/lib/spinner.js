import React, { useEffect, useState } from "react"
import { NumericFormat } from "react-number-format"

// Number of decimals implied by a step, e.g. 1 -> 0, 0.01 -> 2.
function decimalsOf(step) {
  const s = String(step)
  const i = s.indexOf(".")
  return i < 0 ? 0 : s.length - i - 1
}

// Number input with up/down buttons and arrow-key stepping, clamped to
// [min, max]. Replaces react-numeric-input (unmaintained, legacy lifecycles).
// Values typed out of range are committed only on blur, after clamping.
export default function Spinner({ value, min, max, step = 1, size, onChange }) {
  const [shown, setShown] = useState(value)
  useEffect(() => setShown(value), [value])

  const digits = decimalsOf(step)
  const clamp = v => Math.min(max, Math.max(min, v))
  const inRange = v => v >= min && v <= max

  const commit = v => {
    const c = clamp(Number(v.toFixed(digits)))
    setShown(c)
    onChange(c)
  }
  const stepBy = n => commit((Number(shown) || 0) + n * step)

  const onValueChange = ({ floatValue, value: text }, { source }) => {
    if (source !== "event") return
    setShown(text)
    if (floatValue !== undefined && inRange(floatValue)) onChange(floatValue)
  }

  const onBlur = () => {
    const v = parseFloat(shown)
    if (isNaN(v)) commit(clamp(Number(value) || min))
    else if (!inRange(v)) commit(v)
  }

  const onKeyDown = e => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      stepBy(1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      stepBy(-1)
    }
  }

  return (
    <span className="spinner">
      <NumericFormat value={shown} size={size} decimalScale={digits} allowNegative={min < 0}
                     onValueChange={onValueChange} onBlur={onBlur} onKeyDown={onKeyDown} />
      <span className="spinner-buttons">
        <button type="button" tabIndex={-1} aria-label="increment" onClick={() => stepBy(1)}>&#9650;</button>
        <button type="button" tabIndex={-1} aria-label="decrement" onClick={() => stepBy(-1)}>&#9660;</button>
      </span>
    </span>
  )
}
