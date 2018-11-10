import React, { Component } from "react"
import "./App.css"
import Thermostat from "./containers/Thermostat.js"

class App extends Component {
  state = {
    ambientTemperature: 68,
    targetTemperature: 68,
    hvacMode: "away",
    // hvacMode: "off",
    // hvacMode: "heating",
    // hvacMode: "cooling",
    awayResumeTime: 12433245,
    // awayResumeTime: null,
    awayResumeMode: "heat",
    hvacFan: false,
  }

  render() {
    return (
      <div className="App">
        <Thermostat
          height="50vw"
          width="50vw"
          away={this.state.away}
          awayResumeTime={this.state.awayResumeTime}
          awayResumeMode={this.state.awayResumeMode}
          ambientTemperature={this.state.ambientTemperature}
          targetTemperature={this.state.targetTemperature}
          hvacMode={this.state.hvacMode}
        />
      </div>
    )
  }
}

export default App
