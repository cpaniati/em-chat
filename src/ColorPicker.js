import React, { Component } from 'react';
import * as firebase from 'firebase';


function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex=hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function calcLuminance(r,g,b){
  var L=0;
  var rgb=[r,g,b];
  /*for(var i=0; i<3;i++){
      var c=rgb[i];
      c=c / 255.0
      c=(c <= 0.03928) ? c/12.92 : ((c+0.055)/1.055) ^ 2.4;
      rgb[i]=c;
  }*/
  L=0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  console.log(rgb);
  console.log(L);
  var color={};
  if (L > 160){
    console.log('dark');
    color.text="dark";
  }else{
    console.log('light');
    color.text="light";
  }

  if (L > 230){
    console.log('dark');
    color.ui="dark";
  }else{
    console.log('light');
    color.ui="light";
  }
  color.brightness=L;
  return color;
  //return L;
}



class ColorPicker extends Component {

  constructor(){
    super();
    this.state={
      currentColor:"white",
      colors:{
        white:["FFFFFF","E7E7E7","CFCFCF","A3A3A3","888888","7B7B7B"],
        black:["616161","525252","3E3E3E","252525","111111","000000"],
        yellow:["FEFFCA","FDFF94","FAFF00","D2D700","9EA200","737600"],
        yellow_green:["ECFFBB","D7FF70","B7FF00","A7EA00","80B300","557700"],
        green:["CAFFBC","AAFF95","33FF00","2CDD00","25BD00","198100"],
        teal:["D1FFF6","8BFFE8","00FFCC","00DCB0","00A685","00775F"],
        sky_blue:["C6F9FF","84F1FF","00E1FF","00B8D2","008FA2","005A66"],
        blue:["B9DFFF","83C7FF","008AFF","0074D5","00569E","003059"],
        blue_purple:["A8B6FF","6C83FF","0028FF","001BAF","00137C","00093A"],
        purple:["D18EFF","BE62FF","9600FF","7500C8","580096","2C004C"],
        pink:["FF9EEB","FF59DD","FF00CB","D000A5","A60084","64004F"],
        red:["FF9E9E","FF7171","FF0000","CB0101","9B0000","610000"],
        red_orange:["FFD2BE","FF8752","FF4D00","EA4700","CD3E00","732300"],
        orange:["FFE3B1","FFCE78","FFA200","E59100","B77400","714700"],
        yellow_orange:["FFF1BA","FFE26B","FFCC00","E7B800","B89200","7A6100"]
      },
      colorSections:["white","black","yellow","yellow_green","green","teal","sky_blue","blue","blue_purple","purple","pink","red","red_orange","orange","yellow_orange"]
    };
  }

  componentWillMount(){

  }

  componentWillUpdate(){

  }

  componentDidMount(){
    this.setState({
      currentColor:this.props.currentColor
    });
  }

  componentDidUpdate(){

  }

  resetColorClick(e){
    this.props.closeColorPicker();
  }

  newColorClick(e){
    e.stopPropagation();
    console.log('new color click');
    var color=e.currentTarget.getAttribute('data-color');
    var rgb=hexToRgb(color);
    var uiColor=calcLuminance(rgb.r,rgb.g,rgb.b);
    if(this.props.type == 'thread'){
      this.props.setNewColor(this.props.type,this.props.thread_id,color,uiColor.text,uiColor.ui,uiColor.brightness);
    }
  }

  renderSwatchSection(colorSection,i){
    return(<div key={colorSection} className="swatchSection" data-color={colorSection}>
      {this.state.colors[colorSection].map(this.renderSwatch.bind(this))}
    </div>);
  }

  renderSwatch(color){
    return(<div key={color} onMouseOut={this.mouseOutColor.bind(this)} onMouseOver={this.mouseOverColor.bind(this)} onClick={this.newColorClick.bind(this)} style={{backgroundColor:"#"+color}} data-color={"#"+color} className="swatch"></div>);
  }

  mouseOverColor(e){
    var color=e.currentTarget.getAttribute('data-color');
    this.setState({
      currentColor:color
    });
  }

  mouseOutColor(e){
    this.setState({
      currentColor:this.props.currentColor
    });
  }


  render() {
    return (
      <div id="colorPicker" style={{backgroundColor:this.state.currentColor}} onClick={this.resetColorClick.bind(this)}>
        <div id="swatches">
          {this.state.colorSections.map(this.renderSwatchSection.bind(this))}
        </div>
      </div>
    );
  }
}

export default ColorPicker;
