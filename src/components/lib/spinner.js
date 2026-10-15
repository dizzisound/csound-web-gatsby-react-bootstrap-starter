import React, { useEffect, useRef, useState } from "react"
import { NumericFormat } from "react-number-format"

// Number of decimals implied by a step, e.g. 1 -> 0, 0.01 -> 2.
function decimalsOf(step) {
  const s = String(step)
  const i = s.indexOf(".")
  return i < 0 ? 0 : s.length - i - 1
}

// Press-and-hold on a button: step once, then repeat after a delay.
const REPEAT_DELAY = 400
const REPEAT_INTERVAL = 50

// Number input with up/down buttons and arrow-key stepping, clamped to
// [min, max] (a missing bound means unbounded). Replaces react-numeric-input
// (unmaintained, legacy lifecycles). Values typed out of range are committed
// only on blur, after clamping.
export default function Spinner({ value, min, max, step = 1, size, onChange }) {
  const [shown, setShown] = useState(value)
  // Latest shown value, readable from the repeat timer without a stale closure.
  const shownRef = useRef(value)
  const show = v => {
    shownRef.current = v
    setShown(v)
  }
  useEffect(() => {
    shownRef.current = value
    setShown(value)
  }, [value])

  const lo = min ?? -Infinity
  const hi = max ?? Infinity
  const digits = decimalsOf(step)
  const clamp = v => Math.min(hi, Math.max(lo, v))
  const inRange = v => v >= lo && v <= hi

  const commit = v => {
    const c = clamp(Number(v.toFixed(digits)))
    show(c)
    onChange(c)
  }
  const stepBy = n => commit((Number(shownRef.current) || 0) + n * step)

  const timer = useRef(null)
  const stopRepeat = () => {
    clearTimeout(timer.current)
    clearInterval(timer.current)
    timer.current = null
  }
  const startRepeat = n => e => {
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault()
    stopRepeat()
    stepBy(n)
    timer.current = setTimeout(() => {
      timer.current = setInterval(() => stepBy(n), REPEAT_INTERVAL)
    }, REPEAT_DELAY)
  }
  useEffect(() => {
    const t = timer
    return () => {
      clearTimeout(t.current)
      clearInterval(t.current)
    }
  }, [])

  const onValueChange = ({ floatValue, value: text }, { source }) => {
    if (source !== "event") return
    show(text)
    if (floatValue !== undefined && inRange(floatValue)) onChange(floatValue)
  }

  const onBlur = () => {
    const v = parseFloat(shownRef.current)
    if (isNaN(v)) commit(clamp(Number(value) || (Number.isFinite(lo) ? lo : 0)))
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

  const buttonProps = n => ({
    type: "button",
    tabIndex: -1,
    onPointerDown: startRepeat(n),
    onPointerUp: stopRepeat,
    onPointerLeave: stopRepeat,
    onPointerCancel: stopRepeat,
  })

  return (
    <span className="spinner">
      <NumericFormat value={shown} size={size} decimalScale={digits} allowNegative={lo < 0}
                     onValueChange={onValueChange} onBlur={onBlur} onKeyDown={onKeyDown} />
      <span className="spinner-buttons">
        <button {...buttonProps(1)} aria-label="increment">&#9650;</button>
        <button {...buttonProps(-1)} aria-label="decrement">&#9660;</button>
      </span>
    </span>
  )
}
