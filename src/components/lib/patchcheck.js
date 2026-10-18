// Development check of an instrument definition against its orchestra: finds
// widgets whose channel the .csd never reads (a control that moves but does
// nothing), duplicate widget ids, and missing note instruments. It reads the
// .csd as text, so it is a heuristic: channel names built at run time from
// variables can't be seen (sprintf/sprintfk with a literal format can).

// Channel names read by the orchestra: literal names, and sprintf/sprintfk
// formats turned into patterns ("waveseed_%d" matches "waveseed_0").
function readChannels(csd) {
  const code = csd.replace(/;.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
  const names = new Set()
  const patterns = []
  const re = /\bchn(?:get|_[kais]|export)(?::\w)?\s*\(?\s*(?:"([^"]+)"|sprintfk?\s*\(\s*"([^"]+)")/g
  let m
  while ((m = re.exec(code))) {
    if (m[1] !== undefined) names.add(m[1])
    else patterns.push(new RegExp("^" + m[2].split(/%[-+ 0#]*\d*(?:\.\d+)?[dfgisxXeE]/)
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".+") + "$"))
  }
  return name => names.has(name) || patterns.some(p => p.test(name))
}

function instrumentNames(csd) {
  const code = csd.replace(/;.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
  const names = new Set()
  for (const m of code.matchAll(/^\s*instr\s+([^\n]+)/gm)) {
    m[1].split(",").forEach(name => names.add(name.trim()))
  }
  return names
}

// [channel, what sends it] for every channel a definition's widgets send.
function widgetChannels(components) {
  const channels = []
  const walk = def => {
    switch (def.type) {
      case "panel":
      case "tabpanel":
        if (def.on) channels.push([def.id, `${def.type} "${def.id}" (on/off switch)`])
        ;(def.widgets || []).forEach(walk)
        break
      case "multifader":
        for (let k = def.start; k < def.start + def.count; k++) channels.push([`${def.id}-${k}`, `multifader "${def.id}"`])
        break
      case "xy":
        channels.push([def.idx, `xy "${def.id}" (x)`], [def.idy, `xy "${def.id}" (y)`])
        break
      case "adsr":
        ;["_a", "_d", "_s", "_r"].forEach(s => channels.push([def.id + s, `adsr "${def.id}"`]))
        if (def.on) channels.push([def.id, `adsr "${def.id}" (on/off switch)`])
        break
      case "scope": // displays only
        break
      default:
        if (def.func) break // custom component: its channels are its own business
        channels.push([def.id, `${def.type} "${def.id}"`])
    }
  }
  components.forEach(walk)
  return channels
}

function duplicateIds(components) {
  const seen = new Set()
  const dups = new Set()
  const walk = def => {
    if (def.id !== undefined) {
      if (seen.has(def.id)) dups.add(def.id)
      seen.add(def.id)
    }
    if (def.type !== "multifader") (def.widgets || []).forEach(walk)
  }
  components.forEach(walk)
  return [...dups]
}

// Returns a list of problems, as sentences; empty when everything matches.
export default function checkPatch(csd, inst) {
  const problems = []
  const reads = readChannels(csd)
  for (const [channel, source] of widgetChannels(inst.components)) {
    if (!reads(channel)) problems.push(`${source} sends on channel "${channel}", but the orchestra never reads it with chnget.`)
  }
  for (const id of duplicateIds(inst.components)) {
    problems.push(`The id "${id}" is used by more than one widget; only one of them can be set from presets, MIDI CC or OSC.`)
  }
  const instruments = instrumentNames(csd)
  for (const name of ["trig", "freqtrig"]) {
    if (!instruments.has(name)) problems.push(`The orchestra has no instrument "${name}", so notes ${name === "trig" ? "in 12edo" : "in other tunings"} can't play (see the README's orchestra contract).`)
  }
  return problems
}
