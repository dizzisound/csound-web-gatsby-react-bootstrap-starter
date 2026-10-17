import React from "react"
import {Button, Row, Col} from "react-bootstrap"
import Instrument from "./instrument.js"
import CsoundContext from "./csoundcontext"
import HFader from "./hfader"
import Select from "react-select"
import OSC from 'osc-js'
import {KeyboardIcon} from './icons'
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
    this.midichannels = [{label: "All Channels", value: 0}];
    this.state.midichannel = this.midichannels[0];
    for (let k = 1; k <= 16; k++) {
      this.midichannels.push({label: 'Chn ' + k, value: k});
    }
    if (this.props.keyboard) {
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
  }


  async componentDidMount() {
    const url = this.props.csoundwasm
    const {Csound} = await import(/* webpackIgnore: true */ url)
    this.csound = await Csound({
      withPlugins: this.props.plugins,
    })
    const csdresp = await fetch(this.props.csd)
    let buf = await csdresp.text()
    let csd = this.props.csd.substring(this.props.csd.lastIndexOf("/") + 1)
    this.csound.fs.writeFileSync(csd, buf)
    let result = await this.csound.compileCsd(csd)
    if (result) {
      this.setState({csoundLoaded: "compiling csd failed"})
    } else {
      await this.csound.start()
      this.setState({csoundLoaded: "running"})
      this.setState({csndstatus: "dbgreen"})
      this.props.onStart && this.props.onStart()
      this.audioContext = await this.csound.getAudioContext()
      let isStarted = this.audioContext.state === "running"
      this.setState({started: isStarted})
      // Output node for display widgets such as the scope (see csoundcontext.js)
      const node = await this.csound.getNode()
      this.setState({engine: node ? {csound: this.csound, audioContext: this.audioContext, node} : null})
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

  }

  webMidiInit(midiAccess) {
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
    this.disconnectOsc()
    if (this.midiAccess) this.midiAccess.onstatechange = null
    if (this.currentInput) this.currentInput.onmidimessage = null
    if (this.csound) {
      this.csound.stop()
      this.csound.destroy()
    }
  }

  getFreq(key) {
    let currentTuning = this.state.currentTuning.value
    let note = (key + currentTuning.basekey) % 12
    let octave = Math.floor((key + currentTuning.basekey) / 12)
    return currentTuning.basefreq * currentTuning.scale[note] * Math.pow(2, octave)
  }

  sendNoteEvent(key, vel, on) {
    let eventStr

    if (this.state.currentTuning.value.name === "12edo") {
      eventStr = `i "trig" 0 0.1 ${on} ${key} ${vel}`
    } else {
      eventStr = `i "freqtrig" 0 0.1 ${on} ${this.getFreq(key)} ${vel}`
    }
    console.log(eventStr)
    this.csound.readScore(eventStr)
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
        this.sendNoteEvent(event.data[1], event.data[2], event.data[2] !== 0 ? 1 : 0)
        break
      case 0x80:
        this.sendNoteEvent(event.data[1], event.data[2], 0)
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
          this.sendNoteEvent(message.args[1], message.args[2], message.args[0]);
        } else if (pathSplit[2] === 'notefreq') {
          const eventStr = `i "freqtrig" 0 0.1 ${message.args[0]} ${message.args[1]} ${message.args[2]}`
          this.csound.readScore(eventStr)
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
    const note = noteMap[event.nativeEvent.code]
    if (note) {
      this.sendNoteEvent(note - 60 + this.state.octave * 12, this.state.velocity, 1)
    }
  }

  onKeyUp(event) {
    if (event.repeat || this.isTyping(event)) return
    const note = noteMap[event.nativeEvent.code]
    if (note) {
      this.sendNoteEvent(note - 60 + this.state.octave * 12, this.state.velocity, 0)
    }
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
      this.sendNoteEvent(note - 60 + this.state.octave * 12, this.state.velocity, 1);
    }
  }
  noteOff = (note) => {
    if (note) {
      this.sendNoteEvent(note - 60 + this.state.octave * 12, this.state.velocity, 0);
    }
  }

  freqOn = (freq,vel) => {
    if(freq) {
      const eventStr = `i "freqtrig" 0 0.1 1 ${freq} ${vel}`;
      console.log(eventStr)
      this.csound.readScore(eventStr);
    }
  }

  freqOff = (freq) => {
    if(freq) {
      const eventStr = `i "freqtrig" 0 0.1 0 ${freq} 0`;
      console.log(eventStr)
      this.csound.readScore(eventStr);
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
