import React, { Component } from 'react';
import * as firebase from 'firebase';
import $ from "jquery";



class Entry extends Component {

  constructor(){
    super();
    this.state={
        entry_menu_open:false
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

  toggleEntryMenu(e){
    this.setState({entry_menu_open:!this.state.entry_menu_open});
  }

  clickEdit(e){
    this.setState({editing:true});
    window.previousText=this.props.text;
    window.previousTitle=this.props.title;
  }

  clickDelete(e){
    this.props.deleteEntry(this.props.entry_id);
  }

  clickSaveEdit(e){
    this.setState({editing:false});
    var target=e.currentTarget;
    var text=$(target).parent().find('.text')[0].innerText;
    var title=$(target).parent().find('.title')[0].innerText;
    this.props.saveEntryEdit(this.props.entry_id,text, title);
  }

  clickCancelEdit(e){
    this.setState({editing:false});
    var target=e.currentTarget;
    setTimeout(function(){
      $(target).parent().find('.text').html(window.previousText);
      $(target).parent().find('.title').html(window.previousTitle);
    },0);
  }

  render(){
    if(this.props.text){
      return(<div data-editing={this.state.editing} key={this.props.entryKey} className="entry">
        <div placeholder="Entry Title..." contentEditable={this.state.editing} className="title">{this.props.title}</div>
        <div className="date">{this.props.dateTime}</div>
        <div placeholder="Entry Text..." contentEditable={this.state.editing} className="text">{this.props.text}</div>
        <div onClick={this.clickSaveEdit.bind(this)} className="save">Save</div>
        <div onClick={this.clickCancelEdit.bind(this)} className="cancel">Cancel</div>
        <div data-open={this.state.entry_menu_open} className="menu" onClick={this.toggleEntryMenu.bind(this)}>
          <div className="menuButton">
            <div></div><div></div><div></div>
          </div>
          <div className="menuWrap">
            <div onClick={this.clickEdit.bind(this)} className="edit">Edit</div>
            <div onClick={this.clickDelete.bind(this)} className="delete">Delete</div>
          </div>
        </div>
      </div>);
    }
  }
}

export default Entry;
