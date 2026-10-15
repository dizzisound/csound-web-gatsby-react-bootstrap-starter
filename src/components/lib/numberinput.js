import React from "react"
import { Row, Col } from "react-bootstrap"
import Spinner from "./spinner"
import Label from "./label"
import Util from "./util"

class NumberInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: this.props.def.defval,
    }
    this.props.def.changeValue = this.setValue.bind(this)
  }

  componentDidMount() {
  }

  onChange = value => {
    if (isNaN(value)) return
    this.setState({ value })
    this.props.onChange(this.props.def.id, value)
  }

  // Values from MIDI CC, OSC, presets and defaults: round to the step's
  // precision and clamp to [min, max], like values entered in the spinner.
  setValue(value) {
    const { min, max, step = 1 } = this.props.def
    let v = Number(Number(value).toFixed(Util.decimalsOf(step)))
    if (min !== undefined) v = Math.max(min, v)
    if (max !== undefined) v = Math.min(max, v)
    this.onChange(v)
  }

  render() {
    let ret = (
      <Col className="colnumberinput">
        <Row className="g-0 justify-content-center dbyellow">
          <Col md="auto">
            <Label tooltip={this.props.def.tooltip} label={this.props.def.label}/>
          </Col>
        </Row>
        <Row className="g-0 justify-content-center"><Col md="auto">
          <Spinner size={this.props.def.size} unit={this.props.def.unit}
                   value={this.state.value}
                   min={this.props.def.min} max={this.props.def.max} step={this.props.def.step}
                   onChange={this.onChange}
          />
        </Col>
        </Row>
      </Col>
    )
    if (this.props.vertical) {
      ret = (
        <Row className="g-0">{ret}</Row>
      )
    }
    return ret
  }
}

export default NumberInput
