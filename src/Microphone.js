import React, { Component } from 'react';
import $ from "jquery";


var two_line=/\n\n/g;
var one_line=/\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char=/\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}


var final_transcript='';
var recognizing=false;
var ignore_onend;
var start_timestamp;

//compares similarity of two strings based on Levenshtein distance
function similarity(s1, s2) {
  var longer=s1;
  var shorter=s2;
  if (s1.length < s2.length) {
    longer=s2;
    shorter=s1;
  }
  var longerLength=longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1=s1.toLowerCase();
  s2=s2.toLowerCase();

  var costs=new Array();
  for (var i=0; i <= s1.length; i++) {
    var lastValue=i;
    for (var j=0; j <= s2.length; j++) {
      if (i == 0)
        costs[j]=j;
      else {
        if (j > 0) {
          var newValue=costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue=Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1]=lastValue;
          lastValue=newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length]=lastValue;
  }
  return costs[s2.length];
}

function popup(message){
  $('#popup').html(message).addClass('active');
  setTimeout(function(){
    $('#popup').removeClass('active');
  },6000);
}

class Microphone extends Component {

  constructor(){
    super();
    this.state={
      final_transcript:"blank",
      micAnimationLevels:[0,0,0,0,0],
      microphoneOn:false,
      browserSupportsSpeechRecognition:true
    };
  }

  componentWillMount(){
    const root=typeof window !== 'undefined' ? window : this;
    const BrowserSpeechRecognition=root.SpeechRecognition ||
                                     root.webkitSpeechRecognition ||
                                     root.mozSpeechRecognition ||
                                     root.msSpeechRecognition ||
                                     root.oSpeechRecognition;
    if (BrowserSpeechRecognition) {
      const recognition=new BrowserSpeechRecognition();
      /*var grammar='#JSGF V1.0; grammar colors; public <color>=aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;'
      var speechRecognitionList=new root.SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars=speechRecognitionList;*/
      recognition.continuous=true;
      recognition.interimResults=true;
      recognition.onstart=this.onstartRecognition.bind(this);
      recognition.onresult=this.onresultRecognition.bind(this);
      recognition.onend=this.onendRecognition.bind(this);
      recognition.onerror=this.onerrorRecognition.bind(this);
      //when user starts / stops talking
      recognition.onsoundstart=this.onsoundstart.bind(this);
      recognition.onsoundend=this.onsoundend.bind(this);
      //when user enables audio capture
      recognition.onaudiostart=this.onaudiostart.bind(this);
      recognition.onaudioend=this.onaudioend.bind(this);
      //recognition.start();
      this.setState({ recognition:recognition });
    } else {
      this.setState({ browserSupportsSpeechRecognition: false });
      popup("<b>This browser doesn't support speech recognition. </b>Please use Chrome Desktop for this.");
    }
  }

  componentWillUpdate(){

  }

  componentDidMount(){

  }

  componentDidUpdate(){

  }

/***************** SPEECH RECOGNITION ******************/

  onaudiostart(){
    console.log('speech recognition audio started');
  }

  onaudioend(){
    console.log('speech recognition audio ended');
  }

  onsoundstart(){
    console.log('speech / sound detected');
    this.setState({
      micAnimationRecording:true
    });
  }

  onsoundend(){
    console.log('speech / sound ended');
    this.setState({
      micAnimationRecording:false
    });
  }

  onresultRecognition(event) {
    console.log('speech recognition result!');
    var interim_transcript='';
    if (typeof(event.results) == 'undefined') {
      //this.state.recognition.onend=null;
      //this.state.recognition.stop();
      return;
    }
    var micAnimationRecording=true;
    for (var i=event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript=event.results[i][0].transcript;
        micAnimationRecording=false;
        var wordSimilarity=similarity(this.state.final_transcript,final_transcript);
        console.log(wordSimilarity);
        var overwrite=false;
        if(wordSimilarity > .85){
          overwrite=true;
        }
        this.props.pass_final_transcript(final_transcript,overwrite);
        this.fadeMicTranscript();
        this.setState({
          final_transcript:final_transcript,
          mic_transcript:final_transcript,
          micAnimationRecording:micAnimationRecording
        });
      } else {
        interim_transcript += event.results[i][0].transcript;
        this.setState({
          mic_transcript:interim_transcript,
          micAnimationRecording:micAnimationRecording
        });
      }
    }
    final_transcript=capitalize(final_transcript);
    /*this.props.pass_final_transcript(final_transcript);
    this.setState({
      final_transcript:final_transcript,
      interim_transcript:interim_transcript,
      micAnimationRecording:micAnimationRecording
    });*/
    //final_span.innerHTML=linebreak(final_transcript);
    //interim_span.innerHTML=linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      //showButtons('inline-block');
    }
  }

  onendRecognition(event) {
    console.log('speech recognition ended!');
    if(this.props.microphoneOn){
      this.state.recognition.stop();
      this.state.recognition.start();
    }else{
        //this.toggleMicAnimation(false);
    }
    //this.props.toggleMic(false);

    //recognizing=false;
    /*if (ignore_onend) {
      return;
    }
    //show mic animation
    if (!final_transcript) {
      return;
    }*/
    /*
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range=document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }*/
  }

  onerrorRecognition(event) {
      console.log('speech recognition error!');
    if (event.error == 'no-speech') {
      console.log('no speech detected');
      //hide mic animation
      ignore_onend=true;
    }
    if (event.error == 'audio-capture') {
      console.log('no microphone detected');
      //hide mic animation
      ignore_onend=true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        console.log('microphone blocked');
      } else {
        console.log('user denied microphone access');
      }
      ignore_onend=true;
    }
  };

  onstartRecognition() {
    //recognizing=true;
    console.log('speech recognition started');
    this.props.toggleMic(true);

    //show mic animation
  };


  /***************** PAGE ANIMATIONS ******************/

  fadeMicTranscript(){
    window.micTranscriptFade=setTimeout(function(){
      this.setState({
        mic_transcript:''
      });
    }.bind(this),1000);
  }

  toggleMicAnimation(setting){
    if(setting){
      console.log('microphone is on');
      clearInterval(window.micAnim);
      window.micAnim=setInterval(function(){
        var micAnimationLevels=this.state.micAnimationLevels;
        for(var i=4; i > 0; i--){
          micAnimationLevels[i]=micAnimationLevels[i-1];
        }
        //console.log(micAnimationLevels);
        if(this.state.micAnimationRecording){
          micAnimationLevels[0]=Math.floor(Math.random()*7)+14;
        }else{
          micAnimationLevels[0]=Math.floor(Math.random()*10);
        }
        /*if(micAnimationLevels[0]>20){
          micAnimationLevels[0] -= -20+micAnimationLevels[0]-Math.floor(Math.random()*10);
        }else if(micAnimationLevels[0]<0){
          micAnimationLevels[0] += 0-micAnimationLevels[0]+Math.floor(Math.random()*10);
        }*/
        this.setState({
          micAnimationLevels:micAnimationLevels,
          micAnimationRecording:false
        });
      }.bind(this),200);
    }else{
      console.log('microphone is off');
      var micAnimationLevels=this.state.micAnimationLevels;
      for(var i=4; i >= 0; i--){
        micAnimationLevels[i]=0;
      }
      this.setState({
        micAnimationLevels:micAnimationLevels,
        micAnimationRecording:false
      });
      clearInterval(window.micAnim);
    }
  }

  toggleMic(e){
    this.props.toggleMic(false);
    if (this.props.microphoneOn) {
      this.state.recognition.stop();
      this.toggleMicAnimation(false);
      //return;
    }else{
      this.state.recognition.start();
      this.toggleMicAnimation(true);
    }
    final_transcript='';
    //recognition.lang=select_dialect.value;
    //this.state.recognition.start();
    ignore_onend=false;
    //show broken microphone;
    start_timestamp=e.timeStamp;
    /*
    if(this.state.microphoneOn){
      recognizing=true;
    }else{
      recognizing=false;
    }*/
    /*this.setState({
      microphoneOn:!this.state.microphoneOn
    }, this.toggleMicAnimation.bind(this));*/
  }

  //used by parent through ref
  startRecognition(){
    this.state.recognition.start();
  }

  stopRecognition(){
    this.state.recognition.stop();
  }

  render() {

    return (
      <div id="microphoneContainer" onClick={this.toggleMic.bind(this)} data-recording={this.props.microphoneOn}>
        <div id="mic_transcript">{this.state.mic_transcript}</div>
        <div id="microphone">
          <div id="micInner"></div>
        </div>
        <div id="micLevels">
          <div className="level" style={{width:this.state.micAnimationLevels[0]}}></div>
          <div className="level" style={{width:this.state.micAnimationLevels[1]}}></div>
          <div className="level" style={{width:this.state.micAnimationLevels[2]}}></div>
          <div className="level" style={{width:this.state.micAnimationLevels[3]}}></div>
          <div className="level" style={{width:this.state.micAnimationLevels[4]}}></div>
        </div>
      </div>
    );
  }
}

export default Microphone;
