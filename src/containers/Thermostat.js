import PropTypes from "prop-types"
import React from "react"
import thermostatBgImg from "../thermostat-bg.png"

class Thermostat extends React.Component {
  getStyles() {
    const colors = { hvacOff: "HSL(0, 0%, 8%)", hvacHeating: "HSL(360, 100%, 45%)", hvacCooling: "HSL(223, 84%, 46%)" }
    // const colors = { hvacOff: "hsl(0, 0%, 8%)", hvacHeating: "HSL(341, 65%, 45%)", hvacCooling: "HSL(278, 54%, 34%)" }
    let dialColor = colors.hvacOff
    if (this.props.hvacMode === "heating") {
      dialColor = colors.hvacHeating
    } else if (this.props.hvacMode === "cooling") {
      dialColor = colors.hvacCooling
    }

    return {
      outerRing: {
        position: "relative",
        display: "inline-block",
        padding: "8vw",
        borderRadius: "50%",
        backgroundColor: "HSL(0, 0%, 98%)",
      },
      insetShadowOverlay: {
        position: "absolute",
        width: "50vw",
        height: "50vw",
        borderRadius: "50%",
        boxShadow: "inset 0 0.5vw 1vw 0.5vw rgba(0, 0, 0, 0.1)",
      },
      dialWrap: {
        backgroundColor: "HSL(0, 0%, 10%)",
        borderRadius: "50%",
      },
      dialContainer: {
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        fill: "red",
        borderRadius: "50%",
      },
      dial: {},
      display: {
        fill: dialColor,
        WebkitTransition: "fill 0.5s",
        transition: "fill 0.5s",
      },
      target: {
        fill: "white",
        textAnchor: "middle",
        fontFamily: "Helvetica, sans-serif",
        alignmentBaseline: "central",
        fontSize: "120px",
        fontWeight: "bold",
        visibility: this.props.away ? "hidden" : "visible",
      },
      ambient: {
        fill: "white",
        textAnchor: "middle",
        fontFamily: "Helvetica, sans-serif",
        alignmentBaseline: "central",
        fontSize: "22px",
        fontWeight: "bold",
      },
      away: {
        fill: "white",
        textAnchor: "middle",
        fontFamily: "Helvetica, sans-serif",
        alignmentBaseline: "central",
        fontSize: "72px",
        fontWeight: "bold",
        opacity: this.props.away ? "1" : "0",
        pointerEvents: "none",
      },
      leaf: {
        fill: "#13EB13",
        opacity: this.props.leaf ? "1" : "0",
        visibility: this.props.away ? "hidden" : "visible",
        WebkitTransition: "opacity 0.5s",
        transition: "opacity 0.5s",
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
    const _self = this

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
    if (this.props.away) {
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

    // The styles change based on state.
    const styles = this.getStyles()

    // Piece it all together to form the thermostat display.
    return (
      <div style={styles.outerRing}>
        <div style={styles.insetShadowOverlay} />
        <div style={styles.dialWrap}>
          <svg
            width={this.props.width}
            height={this.props.height}
            style={styles.dialContainer}
            viewBox={["0 0 ", diameter, " ", diameter].join("")}
          >
            <filter id="dial" x="0%" y="0%" width="100%" height="100%">
              <feImage xlinkHref={thermostatBgImg} />
              {/* {(this.props.hvacMode === "heating" || this.props.hvacMode === "cooling") && (
                <feColorMatrix
                type="matrix"
                values=".7   0   0   0   0
                0  .7   0   0   0
                0   0  .7   0   0
                0   0   0   1   0 "
                />
              )} */}
            </filter>
            <filter id="display" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.5" />
            </filter>
            <circle cx={radius} cy={radius} r={radius} style={styles.dial} filter="url(#dial)" />
            <circle cx={radius} cy={radius} r={radius * 0.7} style={styles.display} filter="url(#display)" />
            <g>{tickArray}</g>
            <text x={radius} y={radius * 0.925} style={styles.target}>
              {Math.round(this.props.targetTemperature)}º
            </text>
            <text x={radius} y={radius * 1.25} style={styles.ambient}>
              Currently {Math.round(this.props.ambientTemperature)}º
            </text>
            <text x={radius} y={radius} style={styles.away}>
              AWAY
            </text>
          </svg>
        </div>
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
  /* Indicates whether or not the thermostat is in "energy savings mode" */
  leaf: PropTypes.bool,
  /* Actual temperature detected by the thermostat */
  ambientTemperature: PropTypes.number,
  /* Desired temperature that the thermostat attempts to reach */
  targetTemperature: PropTypes.number,
  /* Current state of operations within the thermostat */
  hvacMode: PropTypes.oneOf(["off", "heating", "cooling"]),
}

Thermostat.defaultProps = {
  height: "100%",
  width: "100%",
  numTicks: 50,
  minValue: 40,
  maxValue: 100,
  away: false,
  leaf: false,
  ambientTemperature: 74,
  targetTemperature: 68,
  hvacMode: "off",
}

export default Thermostat
