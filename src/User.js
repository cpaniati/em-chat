import React, { Component } from 'react';
import * as firebase from 'firebase';

class User extends Component {

  componentWillMount(){

  }

  componentWillUpdate(){

  }

  /*componentWillRecieveProps(nextProps){
    this.setState({
      user:this.props.user
    })
  }*/

  componentDidMount(){
    console.log('mounting User.js');
    this.componentDidUpdate();
  }

  componentDidUpdate(){
    console.log('updating firebase user object – User.js');
    var user=this.props.user;
    console.log(user);
    if(user.fid){
      var user_REF=this.props.rootRef.child('users').child(user.fid);
      user_REF.update(user);
    }
  }


  render() {
    return false;
  }
}

export default User;
