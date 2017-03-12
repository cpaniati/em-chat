import React, { Component } from 'react';
import * as firebase from 'firebase';





class Login extends Component {

  componentWillMount(){

  }

  componentWillUpdate(){

  }

  componentDidMount(){

  }

  componentDidUpdate(){

  }



  render() {
    return (
      <div>
        <div id="login" onClick={this.props.facebookSignin}>
          Login
        </div>
      </div>
    );
  }
}

export default Login;
