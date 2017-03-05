import React, { Component } from 'react';
import * as firebase from 'firebase';





class AppHome extends Component {
  
  componentWillMount(){

  }

  componentWillUpdate(){

  }

  componentDidMount(){

  }

  componentDidUpdate(){

  }

  renderThreadsNav(){
    return (
      <div id="threads_nav">
        {this.renderThreads}
      </div>
    );
  }

  renderThreads(){
    return (
      <div id="threads">
        {this.props.threads.map(this.renderEachThread.bind(this))}
      </div>
    );
  }

  renderEachThread(thread, i){
    return (
      <div class="thread">
        <div class="threadTitle">
          {thread.title}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div id="container">
        {this.renderThreadsNav}
      </div>
    );
  }
}

export default AppHome;
