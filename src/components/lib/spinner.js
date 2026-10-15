import { useEffect, useRef, useState } from "react"
import { NumericFormat } from "react-number-format"
import Util from "./util"

// Press-and-hold on a button: step once, then repeat after a delay.
const REPEAT_DELAY = 400
const REPEAT_INTERVAL = 50

// Number input with up/down buttons and arrow-key stepping, clamped to
// [min, max] (a missing bound means unbounded). Replaces react-numeric-input
// (unmaintained, legacy lifecycles). Buttons and arrow keys commit at once;
// typed text is committed on Enter or blur, rounded and clamped.
export default function Spinner({ value, min, max, step = 1, size, onChange }) {
  const [shown, setShown] = useState(value)
  // Follow external value changes (MIDI, OSC, presets) during render rather
  // than in an effect; keep typed text such as "4." that already equals it.
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (parseFloat(shown) !== value) setShown(value)
  }
  // Latest shown and value, readable from the repeat timer without a stale closure.
  const shownRef = useRef(shown)
  const valueRef = useRef(value)
  useEffect(() => {
    shownRef.current = shown
    valueRef.current = value
  })

  const lo = min ?? -Infinity
  const hi = max ?? Infinity
  const digits = Util.decimalsOf(step)
  const clamp = v => Math.min(hi, Math.max(lo, v))

  const commit = v => {
    const c = clamp(Number(v.toFixed(digits)))
    // Keep typed text that already equals c (e.g. "4."): swapping it for a
    // numerically equal value confuses NumericFormat's next keystroke.
    if (parseFloat(shownRef.current) !== c) {
      shownRef.current = c
      setShown(c)
    }
    if (c !== valueRef.current) {
      valueRef.current = c
      onChange(c)
    }
  }
  const stepBy = n => commit((Number(shownRef.current) || 0) + n * step)

  // Typed text: an empty or unparsable field restores the current value.
  const commitTyped = () => {
    const v = parseFloat(shownRef.current)
    if (isNaN(v)) setShown(value)
    else commit(v)
  }

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

  const onValueChange = ({ value: text }, { source }) => {
    if (source !== "event") return
    shownRef.current = text
    setShown(text)
  }

  // Typed text that hasn't been sent yet (Enter or blur commits it).
  const pending = parseFloat(shown) !== value && String(shown) !== String(value ?? "")

  const onKeyDown = e => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      stepBy(1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      stepBy(-1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      commitTyped()
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
                     className={pending ? "spinner-pending" : undefined}
                     title={pending ? "Press Enter to apply" : undefined}
                     onValueChange={onValueChange} onBlur={commitTyped} onKeyDown={onKeyDown} />
      <span className="spinner-buttons">
        <button {...buttonProps(1)} aria-label="increment">&#9650;</button>
        <button {...buttonProps(-1)} aria-label="decrement">&#9660;</button>
      </span>
    </span>
  )
}
