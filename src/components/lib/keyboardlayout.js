import {useState} from "react";
import {Container, Row, Col, Tabs, Tab} from "react-bootstrap";
import Terpstra from "./terpstra";

const KeyboardLayout = (props) => {
  // only the visible tab listens to the computer keyboard
  const [tab, setTab] = useState("keyb12")
  var bc = new BroadcastChannel(props.name);
  const noteOn = note => {
    console.log("post noteon",note)
    bc.postMessage({noteon:note})
  }
  const noteOff = note => {
    console.log("post noteoff",note)
    bc.postMessage({noteoff:note})
  }
  const freqOn = freq => {
    console.log("post freqon",freq)
    bc.postMessage({freqon:freq})
  }
  const freqOff = freq => {
    console.log("post freqoff",freq)
    bc.postMessage({freqoff:freq,vel:0})
  }

  return (
        <>
          <Container fluid="false">
            <Row><Col md="auto">
              <Row className="justify-content-md-center">
                <Col>
                  <Row>
                    <Col>
                      <h3>keyboards</h3>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Tabs activeKey={tab} onSelect={k => setTab(k)} id="keyboardtabs" className="mb-3">
                        <Tab eventKey="keyb12" title="12edo">
                          <Terpstra type={0} active={tab === "keyb12"} noteOn={noteOn} noteOff={noteOff}/>
                        </Tab>
                        <Tab eventKey="keyb31" title="31jt">
                          <Terpstra type={1} active={tab === "keyb31"} freqOn={freqOn} freqOff={freqOff}/>
                        </Tab>
                        <Tab eventKey="keyb53" title="53jt">
                          <Terpstra type={2} active={tab === "keyb53"} freqOn={freqOn} freqOff={freqOff}/>
                        </Tab>
                        <Tab eventKey="keyb12jt" title="12jt">
                          <Terpstra type={3} active={tab === "keyb12jt"} freqOn={freqOn} freqOff={freqOff}/>
                        </Tab>
                      </Tabs>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            </Row>
          </Container>
        </>
      )
}

export default KeyboardLayout
