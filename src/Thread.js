import React, { Component } from 'react';
import * as firebase from 'firebase';
import Entry from './Entry';
import $ from "jquery";


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


class Thread extends Component {

  constructor(){
    super();
    this.state={
      entry_data:{
        text:false,
        title:false
      }
    };
  }

  componentWillMount(){

  }

  componentWillUpdate(){

  }

  componentDidMount(){
    this.componentDidUpdate();
  }

  componentDidUpdate(){
  }

  scrollEntries(e){
    if(e.currentTarget.scrollTop > 80){
      this.props.hideTopNav();
    }else{
      this.props.showTopNav();
    }
  }

  renderEntries(){
    if(this.props.thread_has_entries && this.props.entries_are_loaded){
      //console.log('thread has entries');
      //console.log(this.props.active_thread_entries);
      return(<div id="entries" onScroll={this.scrollEntries.bind(this)}>
        {Object.keys(this.props.active_thread_entries).map(this.renderEntry.bind(this))}
      </div>);
    }else{
      //console.log('thread has no entries');
    }
  }

  renderEntry(entryKey){
    var entry=this.props.active_thread_entries[entryKey];
    this.currentEntry=entry;
    var dateTime=new Date(entry.created_date);
    dateTime=dateTime.toISOString().replace(/z|t/gi,' ').trim().slice(0,-12);
    var title=false;
    var showTitle=false;
    if(entry.title){
      showTitle=true;
      title=entry.title;
    }
    if(entry.text){
      return(<Entry
        key={entry.id}
        saveEntryEdit={this.props.saveEntryEdit}
        deleteEntry={this.props.deleteEntry}
        entry_data={this.props.entry_data}
        entryKey={entryKey}
        title={title}
        dateTime={dateTime}
        entry_id={entry.id}
        text={entry.text}
      />);
    }
  }

  renderEntrySentence(sentence_key,i){
    var sentence=this.currentEntry.transcript[sentence_key];
    return(<div key={sentence_key} className="entryItem">
      {sentence.text+'. '}
    </div>);
  }


  newEntryClick(e){
    console.log('new entry click');
    this.props.newEntry("text");
  }

  finishEntryClick(e){
    this.props.finishEntry(this.props.active_entry);
  }

  mainMenuButtonClick(e){
    this.props.toggleMainMenu();
  }

  renderMainMenu(){
    return(<div id="mainMenuWrap">
      <div key="menuButton" id="mainMenuButton" onClick={this.mainMenuButtonClick.bind(this)}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div key="mainMenu" id="mainMenu" data-visible={this.props.mainMenuVisible}>
        <div key="logout" id="logout" onClick={this.props.logout.bind(this)}>logout</div>
      </div>
    </div>)
  }

  renderEntryNav(){
    if(this.props.active_thread=="everything" && !this.props.active_entry){
      return(<div>
        {this.renderMainMenu()}
        <div key="addEntry" data-home="true" onClick={this.newEntryClick.bind(this)} style={{color:this.props.active_thread_data.color}} id="addEntry">+</div>
      </div>);
    }else if(!this.props.active_entry && this.props.active_thread && this.props.active_thread != "everything"){
      return(<div>
        {this.renderMainMenu()}
        <div key="addEntry" onClick={this.newEntryClick.bind(this)} style={{color:this.props.active_thread_data.color}} id="addEntry">+</div>
      </div>);
    }else if(this.props.active_entry && this.props.active_thread){
      return(<div>
        <div key="finishEntry" onClick={this.finishEntryClick.bind(this)} style={{color:this.props.threads[this.props.active_thread].color}} id="finishEntry">Done</div>
      </div>);
    }
  }

  blurEntryTitle(e){
    console.log('blurred entry title');
    var entry_data=this.props.entry_data;
    entry_data.title=e.currentTarget.textContent;
    this.props.updateEntry(this.props.active_entry,entry_data);
    /*
    this.setState({
      entry_data: entry_data
    }, function(){
      this.props.updateEntry(this.props.active_entry,this.state.entry_data);
    });*/
  }

  blurEntryText(e){
    console.log('blurred entry text');
    var entry_data=this.props.entry_data;
    entry_data.text=e.currentTarget.innerText;
    this.props.updateEntry(this.props.active_entry,entry_data);
    /*
    this.setState({
      entry_data: entry_data
    }, function(){
      this.props.updateEntry(this.props.active_entry,this.state.entry_data);
    });*/
  }

  onKeyDownEntry(e){
    var el = e.currentTarget.parentNode;
    window.isScrolledToBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 50;
  }


  onKeyPressEntry(e){
    var el = e.currentTarget.parentNode;
    if(window.isScrolledToBottom)
      el.scrollTop = 100000;
  }

  setFocus(e){
    this.props.setMicFocus("entry");
  }

  renderNewEntry(){
    var show_mic = (this.props.mic_location=="entry"?true:false);
    if(this.props.active_entry){
      var today=new Date().toISOString().replace(/z|t/gi,' ').trim().slice(0,-12);
      var title=(this.props.entry_data.title != false ? this.props.entry_data.title : "");
      var text=(this.props.entry_data.text != false ? this.props.entry_data.text : "");
      return(
        <div id="newEntryContainer">
          <div contentEditable="true" onBlur={this.blurEntryTitle.bind(this)} placeholder="Entry Title..." className="title">{title}</div>
          <div className="date">{today}</div>
          <div data-show-mic={show_mic} contentEditable="true" onFocus={this.setFocus.bind(this)} onKeyDown={this.onKeyDownEntry.bind(this)} onKeyPress={this.onKeyPressEntry.bind(this)} onBlur={this.blurEntryText.bind(this)} placeholder="Entry Text..." className="entryInput">{text}</div>
        </div>
      );
    }
  }



  render() {
    var color=this.props.active_thread_data.color;
    if(this.props.new_color != false ){
      //console.log('using new color');
      color=this.props.new_color;
    }
    color=hexToRgb(color);

    var gradientVisible = true;
    var dashboard_disclaimer = false;
    if(this.props.active_thread=="user"){
      gradientVisible = false;
      dashboard_disclaimer = true;
    }
    //<div id="dashboard_disclaimer" data-visible={dashboard_disclaimer}>Dashboard Coming Soon!</div>
    return (
      <div id="threadPage">
        {this.renderEntryNav()}
        {this.renderEntries()}
        <div id="newEntryWrap">{this.renderNewEntry()}</div>
        <div id="bottomGradient" data-visible={gradientVisible} style={{background:'linear-gradient(to bottom, rgba('+color.r+','+color.g+','+color.b+',0) 0%,rgba('+color.r+','+color.g+','+color.b+',0.1) 15%,rgba('+color.r+','+color.g+','+color.b+',0.5) 55%,rgba('+color.r+','+color.g+','+color.b+',.9) 100%)'}}></div>
      </div>
    );
  }
}
//<div id="bottomGradient" data-visible={gradientVisible} style={{background:'linear-gradient(to bottom, rgba('+color.r+','+color.g+','+color.b+',0) 0%,rgba('+color.r+','+color.g+','+color.b+',1) 100%)'}}></div>

export default Thread;
