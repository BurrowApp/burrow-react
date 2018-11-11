import React, { Component } from "react"

class ControlsButton extends Component {
  render() {
    const styles = {
      controlsButtonOuter: {
        textAlign: "center",
      },
      controlsButton: {
        backgroundColor: "HSL(300, 0%, 10%)",
        width: "20vw",
        height: "20vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
      },
      buttonIcon: {
        maxWidth: "50%",
        maxHeight: "50%",
      },
      buttonLabel: {
        display: "inline-block",
        marginTop: "1.5vw",
        fontWeight: "600",
      },
    }
    return (
      <div style={styles.controlsButtonOuter}>
        <div style={styles.controlsButton} onClick={this.props.handleClick}>
          <img src={this.props.buttonIcon} style={styles.buttonIcon} />
        </div>
        {this.props.buttonLabel && <span style={styles.buttonLabel}>{this.props.buttonLabel}</span>}
      </div>
    )
  }
}

export default ControlsButton
