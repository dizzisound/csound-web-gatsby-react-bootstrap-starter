import React from "react"
import { Row, Col } from "react-bootstrap"
import Label from "./label"
import { Stage, Layer, Circle } from "react-konva"
import Util from "./util"

class XY extends React.Component {
  constructor(props) {
    super(props)
    this.state = { x: props.def.defval[props.def.idx], y: props.def.defval[props.def.idy] }
    this.h = props.def.height
    this.props.def.changeValue = this.setValue.bind(this)
  }

  componentDidMount() {
  }

  // per-axis tooltip: the definition's own tooltip plus the axis' OSC address
  axisTooltip(axisId) {
    const { tooltipBase, tooltip, osc, id } = this.props.def
    const base = tooltipBase !== undefined ? tooltipBase : (tooltip || "")
    return (base + (osc ? " osc:/" + osc + "/" + id + "/" + axisId : "")).trim()
  }

  round(val) {
    return Math.round(val * 1000) / 1000
  }

  toPixX(valX) {
    return (this.h - 2) * (valX - this.props.def.minX) / (this.props.def.maxX - this.props.def.minX) - 2
  }

  toPixY(valY) {
    return (this.h - 2) * (valY - this.props.def.minY) / (this.props.def.maxY - this.props.def.minY) - 2
  }

  fromPixX(x) {
    return ((x - 2) / (this.h - 2)) * (this.props.def.maxX - this.props.def.minX) + this.props.def.minX
  }

  fromPixY(y) {
    return ((y - 2) / (this.h - 2)) * (this.props.def.maxY - this.props.def.minY) + this.props.def.minY
  }

  // `val` may carry only one coordinate (e.g. OSC /<ns>/<id>/<idx> v):
  // the other one keeps its current value
  setValue(val) {
    const v = val && typeof val === "object" ? val : {}
    const x = v[this.props.def.idx] !== undefined ? v[this.props.def.idx] : this.state.x
    const y = v[this.props.def.idy] !== undefined ? v[this.props.def.idy] : this.state.y
    this.setState({ x: x, y: y })
    this.circle.x(this.toPixX(x))
    this.circle.y(this.toPixY(y))
    this.props.onChange(this.props.def.id, {
      [this.props.def.idx]: this.round(x),
      [this.props.def.idy]: this.round(y),
    })
  }

  drag() {
    let x = this.fromPixX(this.circle.attrs.x)
    let y = this.fromPixY(this.circle.attrs.y)
    this.setState({ x: x, y: y })
    this.props.onChange(this.props.def.id, {
      [this.props.def.idx]: this.round(x),
      [this.props.def.idy]: this.round(y),
    })
  }

  dragBound(pos) {
    let x = pos.x
    let y = pos.y
    if (x < 2) x = 2
    if (y < 2) y = 2
    if (y > this.h) y = this.h
    if (x > this.h) x = this.h
    if (this.props.def.sum) {
      if (x + y > this.h + 2) {
        y = Math.abs(this.h + 2 - x)
      }
    }
    return { x: x, y: y }
  }

  render() {
    const dx = this.toPixX(this.props.def.defval[this.props.def.idx])
    const dy = this.toPixY(this.props.def.defval[this.props.def.idy])
    return (
      <Col xs="auto">
        <Row>
          <Label tooltip={this.axisTooltip(this.props.def.idx)} label="x:"/>
          <Col className="xyvalue">{this.round(this.state.x)}</Col>
          <Label tooltip={this.axisTooltip(this.props.def.idy)} label="y:"/>
          <Col className="xyvalue">{this.round(this.state.y)}</Col>
        </Row>
        <Row className="g-0 justify-content-center">
          <Col xs="auto" className="xypad">
            <Stage width={this.h + 2} height={this.h + 2}>
              <Layer>
                <Circle dragBoundFunc={this.dragBound.bind(this)} onDragMove={this.drag.bind(this)}
                        ref={ref => (this.circle = ref)} x={dx} y={dy} radius={6} fill={Util.cssColor("var(--cs-accent)")}
                        stroke={Util.cssColor("var(--cs-bg)")} strokeWidth={1} draggable>
                </Circle>
              </Layer>
            </Stage>
          </Col>
        </Row>
      </Col>
    )
  }

}

export default XY
