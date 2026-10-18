import React from "react"
import {Button, Row, Col} from "react-bootstrap"
import Instrument from "./instrument.js"
import CsoundContext from "./csoundcontext"
import HFader from "./hfader"
import Select from "react-select"
import OSC from 'osc-js'
import {KeyboardIcon, SkullIcon} from './icons'
import {withPrefix} from "gatsby";

const noteMap = {
  KeyZ: 60,
  KeyS: 61,
  KeyX: 62,
  KeyD: 63,
  KeyC: 64,
  KeyV: 65,
  KeyG: 66,
  KeyB: 67,
  KeyH: 68,
  KeyN: 69,
  KeyJ: 70,
  KeyM: 71,
  Comma: 72,
  KeyL: 73,
  Period: 74,
  KeyQ: 72,
  Digit2: 73,
  KeyW: 74,
  Digit3: 75,
  KeyE: 76,
  KeyR: 77,
  Digit5: 78,
  KeyT: 79,
  Digit6: 80,
  KeyY: 81,
  Digit7: 82,
  KeyU: 83,
  KeyI: 84,
  Digit9: 85,
  KeyO: 86,
  Digit0: 87,
  KeyP: 88,
  BracketLeft: 89,
  Equal: 90,
  BracketRight: 91,
}

// Small status pill with a coloured dot; `title` holds the details.
const StatusBadge = ({level, text, title}) => (
  <span className={"status-badge " + level} title={title}>
    <span className="status-dot" />{text}
  </span>
)

class CsoundInstr extends React.Component {
  constructor(props) {
    super(props)
    let t = {value: {name: "12edo"}, label: "12edo"}
    this.state = {
      csoundLoaded: "loading",
      csndstatus: "dbyellow",
      started: true,
      midi: false,
      velocity: 100,
      octave: 5,
      currentTuning: t,
      osc: 'off', // off | connecting | connected | failed
      engine: null, // for CsoundContext, set once Csound runs
    }
    this.inst = props.inst
    this.instrument = React.createRef()
    this.options = props.tunings.map(tuning => {
      return {value: tuning, label: tuning.name}
    })
    this.options.unshift(t)
    this.root = React.createRef()
    // Sounding notes, keyed by where they came from ("kbd:KeyZ", "midi:1:60",
    // "osc:60", ...), each with the score event its note-on sent. The note-off
    // replays that event, so moving the octave fader or changing the tuning
    // while a note is held can't leave its voice running.
    this.held = new Map()
    this.midichannels = [{label: "All Channels", value: 0}];
    this.state.midichannel = this.midichannels[0];
    for (let k = 1; k <= 16; k++) {
      this.midichannels.push({label: 'Chn ' + k, value: k});
    }
  }

  // The screen keyboard popup (src/pages/keyboard.js) talks to the page over
  // this channel; opened on mount and closed on unmount.
  openKeyboardChannel() {
    if (!this.props.keyboard) return
    this.bc = new BroadcastChannel(this.props.keyboard);
    this.bc.onmessage = msg => {
      console.log(msg);
      if (msg.data.noteon) {
        this.noteOn(msg.data.noteon);
      }
      if (msg.data.noteoff) {
        this.noteOff(msg.data.noteoff);
      }
      if (msg.data.freqon) {
        this.freqOn(msg.data.freqon.freq,msg.data.freqon.vel);
      }
      if (msg.data.freqoff) {
        this.freqOff(msg.data.freqoff.freq);
      }
    }
  }


  // Csound loads in several asynchronous steps, and the page can be left
  // (unmounted) during any of them: after each await, stop if it was. Until
  // the engine is complete it lives in `csound`, released by the `finally`
  // below; once in this.csound, componentWillUnmount releases it.
  async componentDidMount() {
    this.mounted = true
    this.openKeyboardChannel()
    let csound
    try {
      const url = this.props.csoundwasm
      const {Csound} = await import(/* webpackIgnore: true */ url)
      if (!this.mounted) return
      csound = await Csound({
        withPlugins: this.props.plugins,
      })
      if (!this.mounted) return
      const csdresp = await fetch(this.props.csd)
      let buf = await csdresp.text()
      if (!this.mounted) return
      let csd = this.props.csd.substring(this.props.csd.lastIndexOf("/") + 1)
      csound.fs.writeFileSync(csd, buf)
      // optional orchestra instrument called by Panic (see allNotesOff)
      this.hasPanicInstr = /^\s*instr\s+panic\b/m.test(buf)
      let result = await csound.compileCsd(csd)
      if (!this.mounted) return
      if (result) {
        this.csound = csound
        this.setState({csoundLoaded: "compiling csd failed"})
      } else {
        await csound.start()
        if (!this.mounted) return
        const audioContext = await csound.getAudioContext()
        if (!this.mounted) return
        // Output node for display widgets such as the scope (see csoundcontext.js)
        const node = await csound.getNode()
        if (!this.mounted) return
        this.csound = csound
        this.audioContext = audioContext
        this.setState({csoundLoaded: "running"})
        this.setState({csndstatus: "dbgreen"})
        this.props.onStart && this.props.onStart()
        this.setState({started: audioContext.state === "running"})
        this.setState({engine: node ? {csound, audioContext, node} : null})
        if (navigator.requestMIDIAccess) {
          console.log("WebMIDI support - yes")
          navigator.requestMIDIAccess().then(this.webMidiInit.bind(this),
            this.webMidiErr.bind(this))
        } else {
          console.log("No WebMIDI support")
          this.setState({midierr: {text: "No WebMIDI", detail: "This browser doesn't support WebMIDI"}})
        }
      }
      this.instrument.current.setDefaultValues();
      this.root.current.focus();
    } catch (err) {
      if (!this.mounted) return
      console.error(err)
      this.setState({csoundLoaded: "failed to start: " + ((err && err.message) || err)})
    } finally {
      if (!this.mounted && csound) CsoundInstr.releaseEngine(csound)
    }
  }

  // Stop Csound and free its audio. destroy() silences it but leaves its
  // AudioContext running, so close that too: otherwise every visit to an
  // instrument page leaves one behind.
  static async releaseEngine(csound) {
    let audioContext
    try { audioContext = await csound.getAudioContext() } catch (err) { /* not created */ }
    try { await csound.stop() } catch (err) { /* not started */ }
    try { await csound.destroy() } catch (err) { console.warn("Csound destroy failed:", err) }
    if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {})
  }

  webMidiInit(midiAccess) {
    if (!this.mounted) return
    console.log("WebMIDI support enabled")
    this.midiAccess = midiAccess
    this.onMidiMessage = this.onMidiEvent.bind(this)
    // fires when a MIDI device is plugged in or out (hot-plugging)
    midiAccess.onstatechange = () => this.refreshMidiDevices()
    this.refreshMidiDevices()
  }

  // Rebuild the input list; keep the selected device if it is still there,
  // otherwise listen to the first available one.
  refreshMidiDevices() {
    const inputs = [...this.midiAccess.inputs.values()].filter(input => input.state !== "disconnected")
    this.devices = inputs.map(input => ({value: input, label: input.name}))
    const previous = this.currentInput
    const kept = previous && this.devices.find(device => device.value.id === previous.id)
    const current = kept || this.devices[0]
    if (previous && (!current || previous !== current.value)) previous.onmidimessage = null
    if (!current) {
      this.currentInput = undefined
      this.setState({
        midi: false, currentDevice: undefined,
        midierr: {text: "No MIDI devices", detail: "WebMIDI works, but no MIDI input device was found"},
      })
      return
    }
    this.currentInput = current.value
    current.value.onmidimessage = this.onMidiMessage
    this.setState({midi: true, currentDevice: current, midierr: undefined})
  }

  webMidiErr(err) {
    if (!this.mounted) return
    console.log(err);
    // Show the browser's reason, e.g. Firefox's "WebMIDI requires a site
    // permission add-on to activate" or a denied permission prompt.
    const reason = (err && (err.message || err.name)) || "unknown error"
    this.setState({midierr: {text: "MIDI unavailable", detail: reason}});
  }

  // OSC is opt-in: the WebSocket to the osc-js bridge on localhost:47100 is
  // opened only when the user asks for it, so pages without a bridge don't
  // log connection errors at startup.
  connectOsc() {
    if (!this.osc) {
      this.osc = new OSC();
      this.osc.on('open', () => this.setState({osc: 'connected'}));
      this.osc.on('close', () => {
        // a late close from a previous socket: the current one is still alive
        const status = this.osc.status();
        if (status === OSC.STATUS.IS_CONNECTING || status === OSC.STATUS.IS_OPEN) return;
        if (this.oscClosing) {
          // our own disconnect; the state is already "off"
          this.oscClosing = false;
          return;
        }
        // a close we didn't ask for means the bridge is missing or went away
        this.setState({osc: 'failed'});
      });
      this.osc.on('error', () => {});
      this.osc.on('*', this.onOSC.bind(this));
    }
    this.oscClosing = false;
    this.setState({osc: 'connecting'});
    this.osc.open({
      host: "localhost",
      port: 47100
    });
  }

  disconnectOsc() {
    if (this.osc) {
      this.oscClosing = true;
      this.osc.close();
      // show "off" right away, so a quick second click reconnects
      this.setState({osc: 'off'});
    }
  }

  onOscButton() {
    if (this.state.osc === 'connected') this.disconnectOsc();
    else if (this.state.osc !== 'connecting') this.connectOsc();
  }

  componentWillUnmount() {
    this.mounted = false
    this.disconnectOsc()
    if (this.bc) {
      this.bc.close()
      this.bc = null
    }
    if (this.midiAccess) this.midiAccess.onstatechange = null
    if (this.currentInput) this.currentInput.onmidimessage = null
    this.held.clear()
    if (this.csound) {
      CsoundInstr.releaseEngine(this.csound)
      this.csound = null
      this.audioContext = null
    }
  }

  getFreq(key) {
    let currentTuning = this.state.currentTuning.value
    let note = (key + currentTuning.basekey) % 12
    let octave = Math.floor((key + currentTuning.basekey) / 12)
    return currentTuning.basefreq * currentTuning.scale[note] * Math.pow(2, octave)
  }

  // Note on/off for MIDI key `key` in the current tuning. `source` identifies
  // the key that plays it (see this.held); by default the key number itself.
  sendNoteEvent(key, vel, on, source = "note:" + key) {
    if (on) this.startNote(source, this.noteTarget(key), vel)
    else this.stopNote(source)
  }

  // The score event that plays `key`: "trig" with the MIDI key in 12edo,
  // "freqtrig" with the frequency in any other tuning.
  noteTarget(key) {
    if (this.state.currentTuning.value.name === "12edo") return {instr: "trig", value: key}
    return {instr: "freqtrig", value: this.getFreq(key)}
  }

  startNote(source, target, vel) {
    if (!this.csound) return
    const previous = this.held.get(source)
    // a second note-on from the same key keeps its voice (as before); one for a
    // different pitch (tuning changed in between) releases the old one first
    if (previous && (previous.instr !== target.instr || previous.value !== target.value)) this.stopNote(source)
    this.held.set(source, target)
    this.readNoteEvent(target, 1, vel)
  }

  stopNote(source) {
    const target = this.held.get(source)
    if (!target) return
    this.held.delete(source)
    this.readNoteEvent(target, 0, 0)
  }

  readNoteEvent(target, on, vel) {
    if (!this.csound) return
    const eventStr = `i "${target.instr}" 0 0.1 ${on} ${target.value} ${vel}`
    console.log(eventStr)
    this.csound.readScore(eventStr)
  }

  // The computer keyboard's notes, when focus leaves the instrument: their
  // key-up events would go elsewhere and never stop them.
  releaseKeyboardNotes() {
    [...this.held.keys()].filter(source => source.startsWith("kbd:")).forEach(source => this.stopNote(source))
  }

  // Panic: a note-off for every note this page started, then the orchestra's
  // optional "panic" instrument for anything else still sounding.
  allNotesOff() {
    [...this.held.keys()].forEach(source => this.stopNote(source))
    if (this.csound && this.hasPanicInstr) this.csound.readScore('i "panic" 0 0.1')
  }

  async getChannel(chn) {
    if (this.csound) {
      return await this.csound.getControlChannel(chn)
    }
  }

  async getTable(fn) {
    if (this.csound) {
      return await this.csound.tableCopyOut(fn)
    }
  }

  async getTableLength(fn) {
    if (this.csound) {
      return await this.csound.tableLength("" + fn)
    }
  }

  onMidiEvent(event) {
    const chn = (event.data[0] & 0x0f) + 1;
    const chfilter = this.state.midichannel.value;
    if (chfilter && chn !== chfilter) return;
    switch (event.data[0] & 0xf0) {
      case 0x90:
        // many keyboards send note-on with velocity 0 instead of note-off
        this.sendNoteEvent(event.data[1], event.data[2], event.data[2] !== 0 ? 1 : 0, `midi:${chn}:${event.data[1]}`)
        break
      case 0x80:
        this.sendNoteEvent(event.data[1], event.data[2], 0, `midi:${chn}:${event.data[1]}`)
        break
      case 0xB0:
        this.instrument.current.setCtrlValue(event.data[1], event.data[2])
        break
      default:
        return
    }
  }

  onOSC(message) {
    const pathSplit = message.address.split('/');
    if (pathSplit.length > 2) {
      if (pathSplit[1] === this.props.osc) {
        if (pathSplit[2] === 'note') {
          this.sendNoteEvent(message.args[1], message.args[2], message.args[0], "osc:" + message.args[1]);
        } else if (pathSplit[2] === 'notefreq') {
          const [on, freq, vel] = message.args
          if (on) this.startNote("oscfreq:" + freq, {instr: "freqtrig", value: freq}, vel)
          else this.stopNote("oscfreq:" + freq)
        } else {
          if (pathSplit.length > 3)
            this.instrument.current.setValues({[pathSplit[2]]: {[pathSplit[3]]: message.args[0]}});
          else
            this.instrument.current.setValues({[pathSplit[2]]: message.args[0]});
        }
      }
    }
  }

  handleStart() {
    if (!this.state.started) {
      this.audioContext.resume()
      this.setState({started: true})
    }
  }

  handleUpdate(id, val) {
    if (!this.csound) return
    if (val instanceof Object) {
      Object.keys(val).forEach(key => {
        this.handleUpdate(key, val[key])
      })
    } else if (val instanceof String || typeof val === "string") {
      this.csound.setStringChannel(id, val)
    } else {
      console.log("set ctrl", id, val)
      this.csound.setControlChannel(id, val)
    }
  }

  // Keys typed into a text field (spinner, fader value box) must not play notes.
  isTyping(event) {
    const t = event.target
    return t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)
  }

  onKeyDown(event) {
    if (event.repeat || this.isTyping(event)) return
    const code = event.nativeEvent.code
    if (code === "Escape") {
      this.allNotesOff()
      return
    }
    const note = noteMap[code]
    if (note) {
      this.sendNoteEvent(note - 60 + this.state.octave * 12, this.state.velocity, 1, "kbd:" + code)
    }
  }

  // Not filtered by isTyping: a key pressed on the instrument and released in a
  // text field must still stop its note.
  onKeyUp(event) {
    if (event.repeat) return
    this.stopNote("kbd:" + event.nativeEvent.code)
  }

  // Focus moved from the instrument to a text field, another window or tab.
  onRootBlur(event) {
    if (event.target === event.currentTarget) this.releaseKeyboardNotes()
  }

  onVelChange(vel) {
    this.setState({velocity: vel})
  }

  onOctaveChange(oct) {
    this.setState({octave: oct})
  }

  handleSelect = (currentTuning) => {
    this.setState({currentTuning}, () =>
      console.log(`Option selected:`, this.state.currentTuning),
    )
  }

  handleMidiSelect = (device) => {
    console.log("selected: ", device.value.name)
    if (this.currentInput && this.currentInput !== device.value) this.currentInput.onmidimessage = null
    this.currentInput = device.value
    device.value.onmidimessage = this.onMidiMessage
    this.setState({currentDevice: device})
  }

  noteOn = (note) => {
    if (note) {
      this.sendNoteEvent(note - 60 + this.state.octave * 12, this.state.velocity, 1, "screen:" + note);
    }
  }
  noteOff = (note) => {
    if (note) {
      this.stopNote("screen:" + note);
    }
  }

  freqOn = (freq,vel) => {
    if(freq) {
      this.startNote("freq:" + freq, {instr: "freqtrig", value: freq}, vel);
    }
  }

  freqOff = (freq) => {
    if(freq) {
      this.stopNote("freq:" + freq);
    }
  }

  onChannelChange(chn) {
    this.setState({midichannel: chn});
  }

  onOpenKeyboard() {
    if(this.kw && !this.kw.closed) {
      this.kw.focus();
    } else {
      this.kw = window.open(withPrefix("/keyboard"), 'keyboardwindow',
      'left=800,top=20,width=800,height=800,toolbar=0,resizable=0')
    }
  }

  csoundBadge() {
    const status = this.state.csoundLoaded
    if (status === "running") return <StatusBadge level="ok" text="Csound" title="Csound is running" />
    if (status === "loading") return <StatusBadge level="warn" text="Csound loading…" />
    return <StatusBadge level="err" text="Csound error" title={"Csound: " + status} />
  }

  render() {
    const {options, devices, midichannels} = this
    return (
      <Row className="instroot" tabIndex={0} onKeyDown={this.onKeyDown.bind(this)} onKeyUp={this.onKeyUp.bind(this)}
           onBlur={this.onRootBlur.bind(this)}
           ref={ref => this.root.current = ref}>
        <Col>
          <Row className="insthead">
            <Col>{this.csoundBadge()}</Col>
            {this.state.csoundLoaded === "running" ? (
              <Col>
                {!this.state.started ?
                  <Button size="sm" variant="warning" onClick={this.handleStart.bind(this)}
                          title="The browser paused audio until you interact with the page">&#9654; Start audio</Button> :
                  <StatusBadge level="ok" text="Audio" title="Audio is running" />
                }
              </Col>
            ) : ""}
            {this.state.csoundLoaded === "running" ? (
              <Col>
                <Button size="sm" variant="outline-danger" onClick={this.allNotesOff.bind(this)}
                        title="All notes off: stops every sounding note (Esc)">
                  <SkullIcon/> Panic
                </Button>
              </Col>
            ) : ""}
            {this.state.midi ? (
              <>
                <Col>
                  <Select onChange={this.handleMidiSelect.bind(this)} options={devices} value={this.state.currentDevice}
                          isClearable={false} isSearchable={false} className="tunselect" classNamePrefix="cs-select"/>
                </Col>
                <Col>
                  <Select onChange={this.onChannelChange.bind(this)} options={midichannels}
                          value={this.state.midichannel}
                          isClearable={false} isSearchable={false} className="tunselect" classNamePrefix="cs-select"/>
                </Col>
              </>
            ) : <Col>{this.state.midierr &&
                  <StatusBadge level="muted" text={this.state.midierr.text} title={this.state.midierr.detail} />}</Col>
            }
            {this.props.osc ? (
              <Col>
                <Button size="sm" variant={this.state.osc === 'connected' ? "primary" : "secondary"}
                        disabled={this.state.osc === 'connecting'}
                        title="OSC via the osc-js bridge on ws://localhost:47100"
                        onClick={this.onOscButton.bind(this)}>
                  {{
                    off: "Connect OSC",
                    connecting: "Connecting OSC…",
                    connected: "OSC connected",
                    failed: "No OSC bridge - retry",
                  }[this.state.osc]}
                </Button>
              </Col>
            ) : ""}
            <Col>
              <Select onChange={this.handleSelect} options={options} value={this.state.currentTuning}
                      isClearable={false} isSearchable={false} className="tunselect" classNamePrefix="cs-select"/>
            </Col>
          </Row>
          <Row><Col>
            <CsoundContext.Provider value={this.state.engine}>
              <Instrument osc={this.props.osc} inst={this.inst} onChange={this.handleUpdate.bind(this)}
                          ref={ref => this.instrument.current = ref}/>
            </CsoundContext.Provider>
          </Col></Row>
          <Row className="g-0 instfooter">
            <Col className="footer-title" md='auto'>Computer keyboard</Col>
            <Col className="footer-label">Velocity</Col>
            <Col className="footer-fader"><HFader onChange={this.onVelChange.bind(this)} defval={100} min={0} max={127}
                         vals={[0, 40, 80, 120]} step={1}/></Col>
            <Col className="footer-label">Octave</Col>
            <Col className="footer-fader"><HFader onChange={this.onOctaveChange.bind(this)} min={0} max={9} defval={5}
                         vals={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} step={1}/></Col>
            {this.props.keyboard ? (
              <Col className="footer-action" md="auto">
                <Button size="sm" onClick={this.onOpenKeyboard.bind(this)} variant="secondary"
                        title="Open the on-screen keyboard in a new window"><KeyboardIcon /> Screen keyboard</Button>
              </Col>
            ) : ""
            }
          </Row>
        </Col>
      </Row>
    )

  }
}

export default CsoundInstr
