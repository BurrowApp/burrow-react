import React, { Component } from "react"
import "./App.css"
import awayIcon from "./away-icon.png"
import ControlsButton from "./components/ControlsButton.js"
import Thermostat from "./containers/Thermostat.js"
import coolingIcon from "./cooling-icon.png"
import decrementIcon from "./decrement-icon.png"
import fanIcon from "./fan-icon.png"
import heatingIcon from "./heating-icon.png"
import incrementIcon from "./increment-icon.png"
import powerIcon from "./power-icon.png"
import settingsIcon from "./settings-icon.png"

const API = "https://burrow.ngrok.io/api"

class App extends Component {
  state = {
    numTicks: 50,
    minValue: 40,
    maxValue: 100,
    ambientTemperature: null,
    targetTemperature: null,
    useFahrenheit: true,
    // hvacMode: "away",
    hvacMode: "off",
    // hvacMode: "heating",
    // hvacMode: "cooling",
    // awayResumeTime: 2000,
    awayResumeTime: null,
    awayResumeMode: "heat",
    fanOn: false,
  }

  convertToFahrenheit = celcTemp => {
    return celcTemp * (9 / 5) + 32
  }

  convertToCelcius = fahrTemp => {
    return ((fahrTemp - 32) * 5) / 9
  }

  handleTempIncrement = () => {
    this.setState(
      prevState => {
        return { targetTemperature: ++prevState.targetTemperature }
      },
      () =>
        fetch(`${API}/therm`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            targetTemp: this.state.useFahrenheit
              ? this.convertToCelcius(this.state.targetTemperature)
              : this.state.targetTemperature,
          }),
        }),
    )
  }

  handleTempDecrement = () => {
    this.setState(
      prevState => {
        return { targetTemperature: --prevState.targetTemperature }
      },
      () =>
        fetch(`${API}/therm`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            targetTemp: this.state.useFahrenheit
              ? this.convertToCelcius(this.state.targetTemperature)
              : this.state.targetTemperature,
          }),
        }),
    )
  }

  syncState() {
    let mode = "a"
    if (this.state.hvacMode === "heating") {
      mode = "h"
    } else if (this.state.hvacMode === "cooling") {
      mode = "c"
    }
    fetch(`${API}/system`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        mode,
        fan: this.state.fanOn,
        power: this.state.awayResumeTime || this.state.hvacMode !== "off",
      }),
    })
  }

  handleFan = () => {
    this.setState(
      {
        fanOn: !this.state.fanOn,
        awayResumeTime: null,
      },
      this.syncState,
    )
  }

  handleCoolMode = () => {
    this.setState(
      {
        hvacMode: "cooling",
        awayResumeTime: null,
      },
      this.syncState,
    )
  }

  handleHeatMode = () => {
    this.setState(
      {
        hvacMode: "heating",
        awayResumeTime: null,
      },
      this.syncState,
    )
  }

  handlePowerMode = () => {
    this.setState(
      {
        hvacMode: "off",
        awayResumeTime: null,
        fanOn: false,
      },
      this.syncState,
    )
  }

  handleAwayMode = () => {
    if (this.state.awayResumeTime) {
      this.syncAwayResumeTime(null)
    } else {
      this.setState(
        {
          hvacMode: "away",
          awayResumeTime: 12434000,
          fanOn: false,
        },
        () => {
          var dateObj = Date.now()
          dateObj += this.state.awayResumeTime * 1000
          dateObj = new Date(dateObj).getTime()
          this.syncAwayResumeTime(dateObj)
        },
      )
    }
  }

  syncAwayResumeTime(awayTime) {
    if (this.state.awayResumeTime)
      fetch(`${API}/schedule`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          away: awayTime,
        }),
      })
  }

  syncAwayFromServer() {
    fetch(`${API}/schedule`)
      .then(response => response.json())
      .then(({ away }) => {
        if (away) {
          const setTime = away - Date.now()
          console.log(setTime)
          this.setState({ awayResumeTime: String(setTime) })
        }
      })
  }

  awayResumeTimer() {
    this.setState({
      awayResumeTime: this.state.awayResumeTime - 1000,
    })
    if (this.state.awayResumeTime < 1000) {
      clearInterval(this.intervalId)
    }
  }

  syncTherm() {
    fetch(`${API}/therm`)
      .then(response => response.json())
      .then(data =>
        this.setState({
          targetTemperature: this.state.useFahrenheit
            ? this.convertToFahrenheit(data.targetTemp.targetTemp)
            : data.targetTemp.targetTemp,
          ambientTemperature: this.state.useFahrenheit
            ? this.convertToFahrenheit(data.tempData.temperature)
            : data.tempData.temperature,
        }),
      )
  }

  syncSystem() {
    fetch(`${API}/system`)
      .then(response => response.json())
      .then(({ mode, power, fan }) => {
        let hvacMode
        if (!power) {
          hvacMode = "off"
        } else if (mode === "a") {
          // hvacMode = "auto"
          console.log("TODO: implement auto")
        } else if (mode === "h") {
          hvacMode = "heating"
        } else if (mode === "c") {
          hvacMode = "cooling"
        }
        this.setState({
          hvacMode,
          fanOn: fan,
        })
      })
  }

  componentDidMount() {
    this.syncTherm()
    this.syncSystem()
    // this.syncAwayFromServer()
    this.thermIntervalId = setInterval(this.syncTherm.bind(this), 1000)
    this.systemIntervalId = setInterval(this.syncSystem.bind(this), 1000)
    this.intervalId = setInterval(this.awayResumeTimer.bind(this), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
    clearInterval(this.thermIntervalId)
    clearInterval(this.systemIntervalId)
  }

  render() {
    const styles = {
      controlsRow: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: "3.5vw",
      },
      controlsTemp: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "60px",
        fontWeight: "600",
        textIndent: "4vw",
      },
    }
    return (
      <div className="App">
        <Thermostat
          width="100vw"
          away={this.state.away}
          fanOn={this.state.fanOn}
          awayResumeTime={this.state.awayResumeTime}
          awayResumeMode={this.state.awayResumeMode}
          ambientTemperature={this.state.ambientTemperature}
          targetTemperature={this.state.targetTemperature}
          hvacMode={this.state.hvacMode}
          useFahrenheit={this.state.useFahrenheit}
        />
        <div style={styles.controlsRow}>
          <ControlsButton buttonIcon={decrementIcon} handleClick={this.handleTempDecrement} />
          <div style={styles.controlsTemp}>{Math.round(this.state.targetTemperature)}º</div>
          <ControlsButton buttonIcon={incrementIcon} handleClick={this.handleTempIncrement} />
        </div>
        <div style={styles.controlsRow}>
          <ControlsButton buttonIcon={coolingIcon} buttonLabel="Cool" handleClick={this.handleCoolMode} />
          <ControlsButton buttonIcon={heatingIcon} buttonLabel="Heat" handleClick={this.handleHeatMode} />
          <ControlsButton buttonIcon={fanIcon} buttonLabel="Fan" handleClick={this.handleFan} />
        </div>
        <div style={styles.controlsRow}>
          <ControlsButton buttonIcon={awayIcon} buttonLabel="Away" handleClick={this.handleAwayMode} />
          <ControlsButton buttonIcon={settingsIcon} buttonLabel="Settings" />
          <ControlsButton buttonIcon={powerIcon} buttonLabel="Power" handleClick={this.handlePowerMode} />
        </div>
      </div>
    )
  }
}

export default App
