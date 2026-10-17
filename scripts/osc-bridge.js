#!/usr/bin/env node
// OSC bridge: relays OSC messages from UDP (Pure Data, Max, TouchOSC, ...) to
// the instrument page, which connects over WebSocket ("Connect OSC" button).
//
//   npm run osc-bridge                       # UDP 41234 -> ws://localhost:47100
//   npm run osc-bridge -- --verbose          # also log every relayed message
//   npm run osc-bridge -- --udp-port 9000 --ws-port 47100
//   npm run osc-bridge -- --host 0.0.0.0     # accept OSC from other machines
//                                            # (e.g. Pd on Windows, bridge in WSL)
//
// Messages sent by the page (none at the moment) would go out over UDP to
// --reply-port (default 41235).
const os = require("os")
const OSC = require("osc-js")

const usage = `Usage: node scripts/osc-bridge.js [options]

  --host <addr>    address to receive OSC on (default 127.0.0.1; 0.0.0.0 = all
                   interfaces, e.g. for Pd on Windows with the bridge in WSL)
  --udp-port <n>   UDP port to receive OSC on (default 41234)
  --ws-port <n>    WebSocket port the page connects to (default 47100)
  --reply-port <n> UDP port for messages from the page (default 41235)
  --verbose        log every relayed message
  --help           show this help`

function parseArgs(argv) {
  const options = { host: "127.0.0.1", udpPort: 41234, wsPort: 47100, replyPort: 41235, verbose: false }
  const ports = { "--udp-port": "udpPort", "--ws-port": "wsPort", "--reply-port": "replyPort" }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") {
      console.log(usage)
      process.exit(0)
    } else if (arg === "--host") {
      const host = argv[++i]
      if (!host || host.startsWith("-")) {
        console.error(`--host needs an address, e.g. 0.0.0.0\n\n${usage}`)
        process.exit(1)
      }
      options.host = host
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true
    } else if (ports[arg]) {
      const port = Number(argv[++i])
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`${arg} needs a port number between 1 and 65535\n\n${usage}`)
        process.exit(1)
      }
      options[ports[arg]] = port
    } else {
      console.error(`Unknown option: ${arg}\n\n${usage}`)
      process.exit(1)
    }
  }
  return options
}

const options = parseArgs(process.argv.slice(2))

const osc = new OSC({
  plugin: new OSC.BridgePlugin({
    udpServer: { host: options.host, port: options.udpPort },
    udpClient: { host: "127.0.0.1", port: options.replyPort },
    wsServer: { host: "localhost", port: options.wsPort },
  }),
})

osc.on("open", () => {
  console.log(`OSC bridge running: UDP ${options.host}:${options.udpPort} -> ws://localhost:${options.wsPort}`)
  if (options.host === "0.0.0.0") {
    // the addresses other machines (or Windows, when the bridge runs in WSL) can send to
    const addresses = Object.values(os.networkInterfaces()).flat()
      .filter((a) => a && a.family === "IPv4" && !a.internal).map((a) => a.address)
    if (addresses.length) console.log(`Send OSC to ${addresses.join(" or ")} port ${options.udpPort}.`)
  }
  console.log('In the page, click "Connect OSC". Stop with Ctrl+C.')
})

osc.on("error", (error) => {
  const message = (error && error.message) || String(error)
  if (/EADDRINUSE/.test(message)) {
    console.error(`A port is already in use (${message}). Is another bridge running?`)
    process.exit(1)
  }
  console.error("OSC bridge error:", message)
})

if (options.verbose) {
  osc.on("*", (message) => console.log(message.address, ...message.args))
}

process.on("SIGINT", () => {
  console.log("\nStopping the OSC bridge.")
  osc.close()
  process.exit(0)
})

osc.open()
