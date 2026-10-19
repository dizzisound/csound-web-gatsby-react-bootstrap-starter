import React from "react"
import BasicKnob from "./basicknob"
import { Row, Col } from "react-bootstrap"
import Label from './label'

class Knob extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: this.props.def.defval,
    }
    this.props.def.changeValue = this.setValue.bind(this)
  }

  componentDidMount() {
  }

  // position on the knob's arc, 0..1 (logarithmic for log knobs)
  arcPosition(v) {
    const { min, max, log } = this.props.def
    return log === true ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min)
  }

  handleChange = (newValue) => {
    // ignore jumps of more than a fifth of the arc (mouse wrapping past the end)
    if (Math.abs(this.arcPosition(newValue) - this.arcPosition(this.state.value)) > 0.2) return
    this.setState({ value: newValue })
    this.props.onChange(this.props.def.id, newValue)
  }

  setValue(value) {
    this.setState({ value: value })
    this.props.onChange(this.props.def.id, value)
  }

  render() {
    let ret = (
      <Col className="colknob">
        <Row className="g-0 justify-content-center">
          <Label tooltip={this.props.def.tooltip}
                 label={this.props.def.unit ? <>{this.props.def.label} <span className="unit">({this.props.def.unit})</span></> : this.props.def.label}/>
        </Row>
        <Row className="g-0 justify-content-center">
          <Col xs="auto">
            <BasicKnob digits={this.props.def.digits} min={this.props.def.min} max={this.props.def.max}
                       step={this.props.def.step} inputColor="var(--cs-text)" fgColor="var(--cs-blue)"
                       bgColor="var(--cs-surface-3)" font="system-ui, sans-serif" fontWeight="600"
                       log={this.props.def.log === true}
                       width={this.props.def.width || 50} height={this.props.def.height || 50} angleOffset={210}
                       angleArc={300} value={this.state.value} onChange={this.handleChange} />
          </Col>
        </Row>
      </Col>
    )
    if (this.props.vertical) {
      ret = (
        <Row>{ret}</Row>
      )
    }
    return ret
  }
}

export default Knob
