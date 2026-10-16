import React from "react"
import { Slider, Rail, Handles, Tracks } from "react-compound-slider"
import { KeyboardHandle, SliderRail, Track } from "./slidercomponents.js"
import Label from './label'
import Util from "./util"
import { Row, Col } from "react-bootstrap"
//import NumberFormat from "react-number-format"
import * as ReactNumberFormat from "react-number-format";

function preventDefault(e) {
  e.preventDefault()
}

function disableScroll() {
  document.body.addEventListener("touchmove", preventDefault, { passive: false })
}

function enableScroll() {
  document.body.removeEventListener("touchmove", preventDefault)
}

class Fader extends React.Component {
  constructor(props) {
    super(props)
    this.sliderStyle = {
      position: "relative",
      width: 25,
      height: 256,
      left: 4,
      border: 0,
      touchAction: "none",
    }
    this.decimalScale = Util.decimalsOf(this.props.def.step)
    // decimals of the values sent to Csound (taken before `log` overrides step)
    this.outDecimals = this.props.def.step ? this.decimalScale : 6
    if (this.props.def.log === true) {
      this.domain = [0, 1]
      this.factor = Math.log(this.props.def.max / this.props.def.min)
      this.props.def.step = 0.001
    } else {
      this.domain = [this.props.def.min, this.props.def.max]
    }
    this.state = {
      values: [this.fromVal(this.props.def.defval)],
      updates: [this.fromVal(this.props.def.defval)],
    }
    if (this.props.def.height) this.sliderStyle.height = this.props.def.height
    this.props.def.changeValue = this.setValue.bind(this)
  }

  fromVal(value) {
    if (this.props.def.log === true) {
      let ret = Math.log(value / this.props.def.min) / this.factor
      return Math.round(ret * 1000) / 1000
    }
    return value
  }


  toVal(value) {
    if (this.props.def.log === true) {
      return this.props.def.min * Math.exp(this.factor * value)
    }
    return value
  }

  componentDidMount() {
  }

  // The only way values leave the fader: rounded to the step's precision (the
  // slider's step arithmetic adds float noise such as 0.7000000000000001).
  // Explicit sets (defaults, presets, MIDI, OSC, typing) always go out; the
  // slider's onUpdate is skipped when it only echoes the value just sent.
  // (Sends before Csound is running are dropped upstream, so an explicit set
  // must never be de-duplicated against them.)
  send(value, explicit = false) {
    const out = Number(Number(value).toFixed(this.outDecimals))
    if (!explicit && out === this.lastSent) return
    this.lastSent = out
    this.props.onChange(this.props.def.id, out)
  }

  onUpdate = updates => {
    this.setState({ updates })
    this.send(this.toVal(updates[0]))
  }

  onChange = values => {
    this.setState({ values })
  }
  // only typing in the value box counts; its own display updates (source "prop") don't
  onTextValueChange = (vals, { source }) => {
    if (source !== "event" || vals.floatValue === undefined) return
    this.setValue(vals.floatValue)
  }
  setValue = (value) => {
    let val = this.fromVal(value)
    this.send(value, true)
    if (val === Math.floor(this.state.values[0] * 1000) / 1000) return
    let values = this.state.values.slice(0)
    values[0] = this.fromVal(value)
    this.setState({ values })
    let updates = this.state.updates.slice(0)
    updates[0] = this.fromVal(value)
    this.setState({ updates })
  }

  formatVal(val) {
    if (this.props.def.log === true) {
      if (val > 6) return Math.floor(val)
      return Math.floor(val * 1000) / 1000
    }
    return Math.floor(val * 1000) / 1000
  }

  render() {
    const {
      state: { values, updates },
    } = this
    return (
      <Col className="colfader">
        <Row className="g-0 justify-content-center">
          <Label tooltip={this.props.def.tooltip} label={this.props.def.label}/>
        </Row>
        <Row className="g-0 justify-content-center"><Col md="auto">
          <Slider
            rootStyle={this.sliderStyle}
            domain={this.domain} // [min, max]
            step={this.props.def.step}
            onUpdate={this.onUpdate}
            onChange={this.onChange}
            onSlideStart={disableScroll}
            onSlideEnd={enableScroll}
            values={values}
            vertical
            reversed
          >
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
            </Rail>
            <Handles>
              {({ handles, getHandleProps }) => (
                <div className="slider-handles">
                  {handles.map(handle => (
                    <KeyboardHandle
                      domain={this.domain}
                      key={handle.id}
                      handle={handle}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </div>
              )}
            </Handles>
            <Tracks left={false} right={false}>
              {({ tracks, getTrackProps }) => (
                <div className="slider-tracks">
                  {tracks.map(({ id, source, target }) => (
                    <Track
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                    />
                  ))}
                </div>
              )}
            </Tracks>
          </Slider>
        </Col>
        </Row>
        <Row className="g-0 justify-content-center"><Col md="auto"><ReactNumberFormat.NumericFormat
          onValueChange={this.onTextValueChange} value={this.formatVal(this.toVal(updates[0]))}
          className="valuebox" suffix={this.props.def.unit ? " " + this.props.def.unit : undefined}
          size={(this.props.def.size || 2) + (this.props.def.unit ? this.props.def.unit.length + 1 : 0)} decimalScale={this.decimalScale} fixedDecimalScale={false} /></Col></Row>
      </Col>
    )
  }
}

export default Fader
