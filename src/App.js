import React, { Component } from "react"
import "./App.css"
import Thermostat from "./containers/Thermostat.js"

class App extends Component {
  state = {
    away: false,
    ambientTemperature: 72,
    targetTemperature: 68,
    hvacMode: "cooling",
  }

  render() {
    return (
      <div className="App">
        <Thermostat
          height="50vw"
          width="50vw"
          away={this.state.away}
          ambientTemperature={this.state.ambientTemperature}
          targetTemperature={this.state.targetTemperature}
          hvacMode={this.state.hvacMode}
        />
      </div>
    )
  }
}

export default App
