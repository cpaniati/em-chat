import React, { PropTypes, Component } from 'react'
import SpeechRecognition from 'react-speech-recognition'

const propTypes = {
  // Props injected by SpeechRecognition
  transcript: PropTypes.string,
  resetTranscript: PropTypes.func,
  browserSupportsSpeechRecognition: PropTypes.bool,
  interimTranscript:PropTypes.string,
  recognition:PropTypes.object
}

class Dictaphone extends Component {
  render() {
    const { recognition, interimTranscript, transcript, resetTranscript, browserSupportsSpeechRecognition } = this.props

    if (!browserSupportsSpeechRecognition) {
      return null
    }

    return (
      <div>
        <button onClick={resetTranscript}>Reset</button>
        <span>{transcript}</span>
        <span>{interimTranscript}</span>
      </div>
    )
  }
}

Dictaphone.propTypes = propTypes

export default SpeechRecognition(Dictaphone)
