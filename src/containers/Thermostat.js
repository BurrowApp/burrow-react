import prettyMs from "pretty-ms"
import PropTypes from "prop-types"
import React from "react"
import coolingIcon from "../cooling-icon.png"
import fanIcon from "../fan-icon.png"
import heatingIcon from "../heating-icon.png"
import thermostatCooling from "../thermostat-cooling.png"
import thermostatHeating from "../thermostat-heating.png"
import thermostatSleep from "../thermostat-sleep.png"

class Thermostat extends React.Component {
  getStyles() {
    return {
      thermostatDisplayWrap: {
        marginBottom: "5vw",
      },
      dialContainer: {
        maxWidth: "100%",
      },
      dial: {
        fill: "HSL(0, 0%, 13%)",
      },
      display: {
        fill: "HSL(0, 0%, 1%)",
        WebkitTransition: "fill 0.5s",
        transition: "fill 0.5s",
      },
      target: {
        fill: "white",
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "100px",
        fontWeight: "600",
        visibility: this.props.hvacMode === "away" || this.props.hvacMode === "off" ? "hidden" : "visible",
      },
      hvacMode: {
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "20px",
        fontWeight: "600",
      },
      ambientTemp: {
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "26px",
        fontWeight: "600",
        visibility: this.props.hvacMode === "away" || this.props.hvacMode === "off" ? "hidden" : "visible",
      },
      ambientTemp2: {
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "26px",
        fontWeight: "600",
        visibility: this.props.hvacMode === "away" || this.props.hvacMode === "off" ? "visible" : "hidden",
      },
      modeIcon: {
        visibility: this.props.hvacMode === "heating" || this.props.hvacMode === "cooling" ? "visible" : "hidden",
      },
      fanIcon: {
        visibility: this.props.fanOn ? "visible" : "hidden",
      },
      resumeTime: {
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "26px",
        fontWeight: "600",
        visibility: this.props.hvacMode === "away" ? "visible" : "hidden",
      },
      awayResumeText: {
        fill: "white",
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "22px",
        fontWeight: "bold",
        opacity: this.props.hvacMode === "away" ? "1" : "0",
      },
      awayResumeTime: {
        fill: "white",
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "30px",
        fontWeight: "bold",
        opacity: this.props.hvacMode === "away" ? "1" : "0",
      },
      away: {
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "74px",
        fontWeight: "600",
        opacity: this.props.hvacMode === "away" ? "1" : "0",
        pointerEvents: "none",
      },
      off: {
        textAnchor: "middle",
        alignmentBaseline: "central",
        fontSize: "80px",
        fontWeight: "600",
        opacity: this.props.hvacMode === "off" ? "1" : "0",
        pointerEvents: "none",
      },
    }
  }

  pointsToPath(points) {
    return [
      points.map((point, iPoint) => [iPoint > 0 ? "L" : "M", point[0], " ", point[1]].join("")).join(" "),
      "Z",
    ].join("")
  }

  rotatePoint(point, angle, origin) {
    const radians = (angle * Math.PI) / 180
    const x = point[0] - origin[0]
    const y = point[1] - origin[1]
    const x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0]
    const y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1]
    return [x1, y1]
  }

  rotatePoints(points, angle, origin) {
    const _self = this
    return points.map(point => _self.rotatePoint(point, angle, origin))
  }

  restrictToRange(val, min, max) {
    if (val < min) return min
    if (val > max) return max
    return val
  }

  render() {
    // Local variables used for rendering.
    const diameter = 400
    const radius = diameter / 2
    const ticksOuterRadius = diameter / 30
    const ticksInnerRadius = diameter / 8
    const tickDegrees = 300
    const rangeValue = this.props.maxValue - this.props.minValue

    // Determine the maximum and minimum values to display.
    let actualMinValue
    let actualMaxValue
    if (this.props.hvacMode === "away" || this.props.hvacMode === "off") {
      actualMinValue = this.props.ambientTemperature
      actualMaxValue = actualMinValue
    } else {
      actualMinValue = Math.min(this.props.ambientTemperature, this.props.targetTemperature)
      actualMaxValue = Math.max(this.props.ambientTemperature, this.props.targetTemperature)
    }
    const min = this.restrictToRange(
      Math.round(((actualMinValue - this.props.minValue) / rangeValue) * this.props.numTicks),
      0,
      this.props.numTicks - 1,
    )
    const max = this.restrictToRange(
      Math.round(((actualMaxValue - this.props.minValue) / rangeValue) * this.props.numTicks),
      0,
      this.props.numTicks - 1,
    )

    // Renders the degree ticks around the outside of the thermostat.
    const tickPoints = [
      [radius - 1, ticksOuterRadius],
      [radius + 1, ticksOuterRadius],
      [radius + 1, ticksInnerRadius],
      [radius - 1, ticksInnerRadius],
    ]
    const tickPointsLarge = [
      [radius - 1.5, ticksOuterRadius],
      [radius + 1.5, ticksOuterRadius],
      [radius + 1.5, ticksInnerRadius + 8],
      [radius - 1.5, ticksInnerRadius + 8],
    ]
    const theta = tickDegrees / this.props.numTicks
    const offsetDegrees = 180 - (360 - tickDegrees) / 2
    const tickArray = []
    for (let iTick = 0; iTick < this.props.numTicks; iTick++) {
      let isLarge
      if (this.props.ambientTemperature >= this.props.targetTemperature) {
        isLarge = iTick === min
      } else if (this.props.ambientTemperature <= this.props.targetTemperature) {
        isLarge = iTick === max
      }
      const isActive = iTick >= min && iTick <= max
      const tickElement = React.createElement("path", {
        key: ["tick-", iTick].join(""),
        d: this.pointsToPath(
          this.rotatePoints(isLarge ? tickPointsLarge : tickPoints, iTick * theta - offsetDegrees, [radius, radius]),
        ),
        style: {
          fill: isActive ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)",
        },
      })
      tickArray.push(tickElement)
    }

    // Make away resume time human readable
    const convertedAwayResumeTime =
      this.props.awayResumeTime && prettyMs(this.props.awayResumeTime, { secDecimalDigits: 0 })

    // The styles change based on state.
    const styles = this.getStyles()

    // Piece it all together to form the thermostat display.
    return (
      <div style={styles.thermostatDisplayWrap}>
        <svg width={this.props.width} style={styles.dialContainer} viewBox={["0 0 ", diameter, " ", diameter].join("")}>
          {this.props.hvacMode === "cooling" && (
            <filter id="dial" x="0%" y="0%" width="100%" height="100%">
              <feImage xlinkHref={thermostatCooling} />
            </filter>
          )}
          {this.props.hvacMode === "heating" && (
            <filter id="dial" x="0%" y="0%" width="100%" height="100%">
              <feImage xlinkHref={thermostatHeating} />
            </filter>
          )}
          {(this.props.hvacMode === "off" || this.props.hvacMode === "away") && (
            <filter id="dial" x="0%" y="0%" width="100%" height="100%">
              <feImage xlinkHref={thermostatSleep} />
            </filter>
          )}
          <filter id="heatingIcon" x="0%" y="0%" width="100%" height="100%">
            <feImage xlinkHref={heatingIcon} />
          </filter>
          <filter id="coolingIcon" x="0%" y="0%" width="100%" height="100%">
            <feImage xlinkHref={coolingIcon} />
          </filter>
          <filter id="fanIcon" x="0%" y="0%" width="100%" height="100%">
            <feImage xlinkHref={fanIcon} />
          </filter>
          <circle cx={radius} cy={radius} r={radius * 0.7} style={styles.display} />
          <circle cx={radius} cy={radius} r={radius} style={styles.dial} filter={"url(#dial)"} />
          <circle
            cx={radius}
            cy={radius * 0.585}
            r={radius * 0.09}
            style={styles.modeIcon}
            filter={
              (this.props.hvacMode === "heating" && "url(#heatingIcon)") ||
              (this.props.hvacMode === "cooling" && "url(#coolingIcon)")
            }
          />
          <circle cx={radius} cy={radius * 1.45} r={radius * 0.08} style={styles.fanIcon} filter="url(#fanIcon)" />
          <g>{tickArray}</g>
          <text x={radius} y={radius * 1.1} style={styles.target}>
            {Math.round(this.props.targetTemperature)}
          </text>
          <text x={radius} y={radius * 1.3} style={styles.resumeTime}>
            {this.props.awayResumeTime > 0 ? convertedAwayResumeTime : ""}
          </text>
          <text x={radius} y={radius} style={styles.away}>
            AWAY
          </text>
          <text x={radius} y={radius} style={styles.off}>
            OFF
          </text>
          <text x={radius * 1.0125} y={radius * 1.45} style={styles.ambientTemp}>
            {Math.round(this.props.ambientTemperature)}º
          </text>
          <text x={radius * 1.0125} y={radius * 0.68} style={styles.ambientTemp2}>
            {Math.round(this.props.ambientTemperature)}º
          </text>
          <text x={radius} y={radius * 0.76} style={styles.hvacMode}>
            {this.props.hvacMode && this.props.hvacMode === "heating" && "Heating"}
            {this.props.hvacMode && this.props.hvacMode === "cooling" && "Cooling"}
          </text>
        </svg>
      </div>
    )
  }
}

Thermostat.propTypes = {
  /* Height of the thermostat (ex: 50% or 400px) */
  height: PropTypes.string,
  /* Width of the thermostat (ex: 50% or 400px) */
  width: PropTypes.string,
  /* Total number of ticks that will be rendered on the thermostat wheel */
  numTicks: PropTypes.number,
  /* Lowest temperature able to be displayed on the thermostat */
  minValue: PropTypes.number,
  /* Highest temperature able to be displayed on the thermostat */
  maxValue: PropTypes.number,
  /* Indicates whether or not the thermostat is in "away mode" */
  away: PropTypes.bool,
  /* Actual temperature detected by the thermostat */
  ambientTemperature: PropTypes.number,
  /* Desired temperature that the thermostat attempts to reach */
  targetTemperature: PropTypes.number,
  /* Current state of operations within the thermostat */
  hvacMode: PropTypes.oneOf(["off", "away", "heating", "cooling"]),
}

export default Thermostat
