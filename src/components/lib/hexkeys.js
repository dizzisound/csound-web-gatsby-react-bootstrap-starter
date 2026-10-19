// The computer keyboard as a patch of the Terpstra hex grid (terpstra.js).
//
// Keyboard rows are offset by about half a key (Q sits between 1 and 2, A
// under Q, Z under A), so the keys form a triangular lattice, like the hex
// grid's neighbours. Each key stands for one hexagon:
// - the next key along a row (Z -> X) is the down-right neighbour,
// - the key above-left (Z -> A, A -> Q, Q -> 1) is the hexagon straight up,
// - so the key above-right (Z -> S) is the up-right neighbour.
// On the grid, up adds 1 / 2 / 5 steps (12, 31, 53 notes per octave) and
// down-right 2 / 3 / 4, so pitch rises to the right and upwards on the
// keyboard: rows of whole tones on the 12-note tab, as in the Wicki-Hayden
// layout.

// Physical key positions (KeyboardEvent.code, the same on QWERTY, QWERTZ,
// AZERTY...), bottom row first.
export const KEY_ROWS = [
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"],
  ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"],
  ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
]

const CHARS = { Comma: ",", Period: ".", Slash: "/", Semicolon: ";", Quote: "'", BracketLeft: "[", BracketRight: "]", Minus: "-", Equal: "=" }

// The character printed on a US keyboard, as the label on its hexagon.
export const keyChar = code => CHARS[code] || code.replace(/^(Key|Digit)/, "")

// Moves on the grid: columns x from the left, rows y counted downwards (the
// lower y, the higher the note); odd columns sit half a hexagon higher.
export const upFrom = ([x, y]) => [x, y - 1]
export const downFrom = ([x, y]) => [x, y + 1]
export const downRightFrom = ([x, y]) => (x % 2 ? [x + 1, y] : [x + 1, y + 1])
export const upLeftFrom = ([x, y]) => (x % 2 ? [x - 1, y - 1] : [x - 1, y])

// { code: [x, y] } for every key, with Z on the hexagon `origin`.
export function keyboardMap(origin) {
  const map = {}
  KEY_ROWS.forEach((row, r) => {
    let pos = origin
    for (let k = 0; k < r; k++) pos = upFrom(pos)
    row.forEach(code => {
      map[code] = pos
      pos = downRightFrom(pos)
    })
  })
  return map
}
