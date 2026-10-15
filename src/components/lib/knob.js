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

  handleChange = (newValue) => {
    if (Math.abs(newValue - this.state.value) > this.props.def.max / 5) return
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
          <Label tooltip={this.props.def.tooltip} label={this.props.def.label}/>
        </Row>
        <Row className="g-0 justify-content-center">
          <Col xs="auto">
            <BasicKnob digits={this.props.def.digits} min={this.props.def.min} max={this.props.def.max}
                       step={this.props.def.step} inputColor="#FFFFFF" fgColor="#0077FF"
                       width={this.props.def.width || 50} height={this.props.def.height || 50} angleOffset={210}
                       angleArc={300} value={this.state.value} onChange={this.handleChange} />
          </Col>
        </Row>
        {this.props.def.unit ? <Row className="g-0 justify-content-center"><span className="unit">{this.props.def.unit}</span></Row> : null}
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
