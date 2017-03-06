import React, { PropTypes, Component } from 'react';
import cookie from 'react-cookie';
import logo_light from './logo_light_shadow.svg';
import logo_dark from './logo_dark.svg';
import './App.css';
import Login from './Login';
import AppHome from './AppHome';
import Onboarding from './Onboarding';
import User from './User';
import Thread from './Thread';
import ColorPicker from './ColorPicker';
import Microphone from './Microphone';
import * as firebase from 'firebase';
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


//capitalize each word
function ucFirstAllWords( str )
{
    var pieces=str.split(" ");
    for ( var i=0; i < pieces.length; i++ )
    {
        var j=pieces[i].charAt(0).toUpperCase();
        pieces[i]=j + pieces[i].substr(1).toLowerCase();
    }
    return pieces.join(" ");
}

//get a cookie from browser
  function getCookie(name) {
      var value="; " + document.cookie;
      var parts=value.split("; " + name + "=");
      if (parts.length == 2) return parts.pop().split(";").shift();
    }


    function setCookie(cname, cvalue, exdays) {
        var d=new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires="expires="+d.toUTCString();
        document.cookie=cname + "=" + cvalue + "; " + expires;
    }


// Initialize Firebase
if (location.hostname === "localhost" || location.hostname === "127.0.0.1"){
  //running development database
  console.log("running development database");
  var config={
    apiKey: "AIzaSyDO-JePP19IMj1w96zxhw9bCRcHMgspKvk",
    authDomain: "emchat-dev.firebaseapp.com",
    databaseURL: "https://emchat-dev.firebaseio.com",
    storageBucket: "emchat-dev.appspot.com",
    messagingSenderId: "260188818848"
  };
}else{
  //running production database
  console.log("running production database");
  var config={
    apiKey: "AIzaSyAgt454hCO1Rm2ZpFqJ-tlAIePNNBauFpQ",
    authDomain: "emchat-adc94.firebaseapp.com",
    databaseURL: "https://emchat-adc94.firebaseio.com",
    storageBucket: "emchat-adc94.appspot.com",
    messagingSenderId: "164164985409"
  };
}

firebase.initializeApp(config);
window.firebase=firebase;

var rootRef=firebase.database().ref();

// Initialize Facebook
var provider=new firebase.auth.FacebookAuthProvider();

provider.addScope('user_birthday');
provider.addScope('user_friends');
provider.addScope('email');

provider.setCustomParameters({
  'display': 'popup'
});

window.initialState={
  login_visible:true,
  face_logged_in:false,
  fire_logged_in:false,
  active_thread:"everything",
  threads:{"everything":{id:"everything",name:"Loading...",color:"#FF7878",textColor:"dark",uiColor:"light",entries:{}}},
  loaded_threads:{},
  entries:{},
  active_entry:false,
  user:{},
  microphoneVisible:false,
  threads_nav_visible:false,
  micAnimationLevels:[0,0,0,0,0],
  convoHistoryVisible:false,
  convoHistoryOpen:false,
  convoHistory:[],
  transcripts:[],
  thread_menu_left:60,
  entries_loaded:false
};



class App extends Component {

  constructor(){
    //var active_thread=(cookie.load('thread_id') ? cookie.load('thread_id') : "everything");
    super();
    this.state={
      login_visible:false,
      face_logged_in:false,
      fire_logged_in:false,
      active_thread:"everything",
      threads:{"everything":{id:"everything",name:"Loading...",color:"#FF7878",textColor:"dark",uiColor:"light",entries:{}}},
      loaded_threads:{},
      entries:{},
      active_entry:false,
      user:{},
      microphoneVisible:true,
      convoHistoryVisible:true,
      threads_nav_visible:true,
      micAnimationLevels:[0,0,0,0,0],
      convoHistoryOpen:false,
      convoHistory:[],
      transcripts:[],
      thread_menu_left:60,
      entries_loaded:false,
      topNavHidden:false
    };
  }

  componentWillMount(){
    this.setState({rootRef:rootRef});
    this.checkForLoginCookie();

    //detect if browser tab is active or inactive
    window.onfocus=this.userReturnedToPage.bind(this);
    window.onblur=this.userLeftPage.bind(this);

  }

  componentWillUpdate(){

  }

  componentDidMount(){

    console.log('mounting app');
    //temporary to test mic and convohistory
    this.setState({
      microphoneVisible:true,
      convoHistoryVisible:true,
      threads_nav_visible:true
    });
  }

  componentDidUpdate(){
    /*var renamingThread=(this.state.renaming_thread_id ? true : false);
    if(renamingThread){
      $('.threadTitle[data-thread-id="'+this.state.renaming_thread_id+'"]').focus();
      this.setState({
        thread_menu_open:false
      });
    }*/

  }



/***************** USER PAGE EVENTS ******************/

userReturnedToPage(){
  if(this.state.microphoneOn){
    this.state.recognition.stop();
    this.state.recognition.start();
  }
}

userLeftPage(){

}

/***************** FACEBOOK FUNCTIONALITY ******************/

  facebookSignin() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token=result.credential.accessToken;
      // The signed-in user info.
      var user=result.user;

      console.log(user);
      console.log(token);

      this.setState({fb_user:user,fb_token:token,face_logged_in:true}, this.firebaseLogin.bind(this));
      // ...
    }.bind(this)).catch(function(error) {
      // Handle Errors here.
      var errorCode=error.code;
      var errorMessage=error.message;
      // The email of the user's account used.
      var email=error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential=error.credential;

      console.log(errorMessage);
      // ...
      alert(errorMessage);
    });
  }

  facebookSignout() {
     firebase.auth().signOut()

     .then(function() {
        console.log('Signout successful!');
        cookie.remove('fid');
        console.log(window.initialState);
        this.setState(window.initialState,this.componentDidMount);
     }.bind(this), function(error) {
        console.log('Signout failed')
     });
  }


  logout(){
    this.facebookSignout();
  }



/***************** FIREBASE FUNCTIONALITY ******************/

  firebaseLogin(){
    var user_id=this.state.fb_user.uid;
    var fb_user_id_REF=rootRef.child('fb_user_ids').child(user_id);

    fb_user_id_REF.once('value', snap => {
      var fid=snap.val();
      console.log(fid);

      if( fid === null ) {
        //set up the new user profile
        console.log('FB User not found –– New User!');
        this.createNewFirebaseId();
      }else{
        //log in the current user
        console.log('FB User found –– Existing User!');
        this.getFirebaseUserData(fid);
      }
    });
  }

  getFirebaseUserData(fid){
    var user_REF=rootRef.child('users').child(fid);
    user_REF.once('value', snap => {
      var user=snap.val();
      console.log(user);

      if( user === null ) {
        //set up the new user profile
        console.log('User not found in Firebase>Users –– Issue!');
      }else{
        //log in the current user
        console.log('User found in Firebase>Users –– Existing User!');
        user.last_login=Date.now();
        this.createFirebaseUserCookie(fid);
        this.userDataUpdated=true;
        var threads=this.state.threads;
        threads["everything"].name=user.name.split(" ")[0];
        this.setState({
          fid:fid,
          fire_logged_in:true,
          user:user,
          threads:threads
        });
        this.getFirebaseThreadData(fid);
      }
    });
  }

  getFirebaseThreadData(fid){
    var threads_REF=rootRef.child('threads')
    var threadReferences=this.state.user.threads;
    for (var key in threadReferences) {
      // skip loop if the property is from prototype
      if (!threadReferences.hasOwnProperty(key)) continue;
      //console.log(key);
      //console.log(threadReferences[key]);
      var thread_Id=threadReferences[key].id;
      //console.log(thread_Id);
      var this_thread_REF=threads_REF.child(thread_Id);
      var threads=this.state.threads;
      var i=0;
      //read each thread from Firebase into current page
      this_thread_REF.once('value', snap => {
        i++;
        var thread=snap.val();
        if( thread === null ) {
          //set up the new user profile
          console.log('Thread not found in Firebase>Threads –– Issue!');
        }else{
          threads[thread.id]=thread;
        }
        if(i == Object.keys(threadReferences).length){
          this.setState({
            threads:threads
          });
        }
      });
    }
  }

  /*checkForThreadCookie(){
    var thread_id=cookie.load('thread_id');
    if(thread_id){
      console.log('thread cookie found');
      this.setState({active_thread:thread_id},function(){
        clearTimeout(window.bottomGradientTimer);
        window.bottomGradientTimer=setTimeout(function(){
          $('#bottomGradient').addClass('active');
          $('#entries').addClass('active');
        },1000);
      });
    }
  }*/

  getFirebaseEntryData(){
    console.log('getting firebase entry data');
    var entries_REF=rootRef.child('entries')
    var entryReferences=this.state.threads[this.state.active_thread].entries;
    var entries=this.state.entries;
    var i=0;
    if(!this.state.loaded_threads[this.state.active_thread]){
      for (var key in entryReferences) {
        // skip loop if the property is from prototype
        if (!entryReferences.hasOwnProperty(key)) continue;
        //console.log(key);
        //console.log(threadReferences[key]);
        var entry_Id=entryReferences[key].id;
        //console.log(thread_Id);
        var this_entry_REF=entries_REF.child(entry_Id);
        //read each thread from Firebase into current page
        this_entry_REF.once('value', snap => {
          i++;
          var entry=snap.val();
          if( entry === null ) {
            //set up the new user profile
            console.log('Thread not found in Firebase>Threads –– Issue!');
          }else{
            entries[entry.id]=entry;
          }
          if(i == Object.keys(entryReferences).length){
            var loaded_threads=this.state.loaded_threads;
            loaded_threads[this.state.active_thread]=true;
            this.setState({
              entries:entries,
              entries_loaded:true,
              loaded_threads:loaded_threads
            },function(){
              //fade in entries and bottom gradient
              clearTimeout(window.bottomGradientTimer);
              window.bottomGradientTimer=setTimeout(function(){
                $('#bottomGradient').addClass('active');
                $('#entries').addClass('active');
              },200);
            });
            console.log('entries retrieved from firebase:');
            console.log(entries);
          }
        });
      }
    }else{
      console.log('thread already loaded');
      this.setState({
        entries_loaded:true
      },function(){
        //fade in entries and bottom gradient
        clearTimeout(window.bottomeGradientTimer);
        window.bottomeGradientTimer=setTimeout(function(){
          $('#bottomGradient').addClass('active');
          $('#entries').addClass('active');
        },200);
      });
    }
  }

  createFirebaseUserCookie(fid){
    //setCookie('fid', fid);
    cookie.save('fid', fid);
    //console.log('cookie: '+getCookie('fid'));
  }

  checkForLoginCookie(){
    var fid=cookie.load('fid');
    if(fid){
      console.log('cookie found:'+fid);
      this.getFirebaseUserData(fid);
    }else{
      console.log('cookie not found');
      this.setState({
        login_visible:true
      });
    }
  }



  //setting up a new user

  createNewFirebaseId(){
    console.log('creating new firebase id');
    var fids_REF=rootRef.child('users');
    var fb_user_id=this.state.fb_user.uid;
    var name=this.state.fb_user.displayName;
    var newId=fids_REF.push().getKey();
    fids_REF.child(newId).set({name:name});
    console.log('new firebase id: '+newId);
    rootRef.child('fb_user_ids').child(fb_user_id).set(newId, function(error){
      //this.setState({newUser});
      this.setupNewUserData(newId, name);
    }.bind(this));
  }

  setupNewUserData(newId, name){
    console.log('setting up new user data:');
    var user_REF=rootRef.child('users');
    var new_user_data={
      has_completed_intro:false,
      name:this.state.fb_user.displayName,
      email:this.state.fb_user.email,
      photo_url:this.state.fb_user.photoURL
    };
    new_user_data.threads={};
    new_user_data.sign_up_date=Date.now();
    new_user_data.last_login=Date.now();
    new_user_data.fid=newId;
    new_user_data.fb_refreshToken=this.state.fb_user.refreshToken;
    new_user_data.fb_token=this.state.fb_token;
    console.log(new_user_data);
    this.createFirebaseUserCookie(newId);
    this.userDataUpdated=true;
    var threads=this.state.threads;
    threads["everything"].name=name.split(" ")[0];
    this.setState({
      user:new_user_data,
      fid:newId,
      fire_logged_in:true,
      threads:threads
    });
  }

  //updating firebase user object when state{user} object is changed.

  firebaseUserUpdateObject(){
    if(this.state.fire_logged_in && this.userDataUpdated){
      console.log('updating user object');
      this.userDataUpdated=false;
      return(<User
        user={this.state.user}
        rootRef={this.state.rootRef}
      />);
    }
  }

  createNewFirebaseThread(){
    console.log('creating new firebase thread:');

    //create new item in threads
    var threads_REF=rootRef.child('threads');
    var fid=this.state.fid;
    var newThreadObject={
      fid:fid,
      name:"New Thread",
      color:"#bbb",
      brightness:200,
      entries:{}
    };
    var newThreadId=threads_REF.push(newThreadObject).getKey();
    threads_REF.child(newThreadId).update({
      id:newThreadId
    });
    newThreadObject.id=newThreadId;
    console.log(newThreadId);

    var threads=this.state.threads;
    threads[newThreadId]=newThreadObject;

    //add thread ref to user profile
    var user=this.state.user;
    if(!user.threads){
      user.threads={};
    }
    user.threads[newThreadId]={
      id:newThreadId
    };
    this.userDataUpdated=true;
    this.setState({
      threads:threads,
      user:user,
      active_thread:newThreadId
    },function(){
      this.beginRenameThread(newThreadId);
    }.bind(this));
  }

  deleteFirebaseThread(thread_id){
    console.log('deleting firebase thread');
    var thread_id=this.state.thread_menu_thread_id;
    var fid=this.state.fid;
    rootRef.child('threads').child(thread_id).set(null);
    rootRef.child('users').child(fid).child('threads').child(thread_id).set(null);
    var threads=this.state.threads;
    delete threads[thread_id];
    var user=this.state.user;
    delete user.threads[thread_id];

    this.userDataUpdated=true;
    this.setState({
      threads:threads,
      user:user,
      active_thread:"everything",
      thread_menu_open:false
    });
  }

  renameFirebaseThread(thread_id, name){
    console.log('renaming firebase thread');
    var fid=this.state.fid;
    rootRef.child('threads').child(thread_id).update({name:name});
    //rootRef.child('users').child(fid).child('threads').child(thread_id).update({name:name});
    var threads=this.state.threads;
    threads[thread_id].name=name;

    this.userDataUpdated=true;
    this.setState({
      threads:threads,
      renaming_thread_id:false,
      thread_menu_open:false
    });
  }

  recolorFirebaseThread(type,thread_id,color,textColor,uiColor,brightness){
    console.log('recoloring firebase thread');
    var fid=this.state.fid;
    rootRef.child('threads').child(thread_id).update({color:color, brightness:brightness});
    var threads=this.state.threads;
    threads[thread_id].color=color;
    threads[thread_id].brightness=brightness;
    var user=this.state.user;

    this.userDataUpdated=true;
    this.setState({
      threads:threads,
      user:user,
      recoloring_thread_id:false,
      thread_menu_open:false,
      recoloring_type:false,
    });
  }


  createNewFirebaseEntry(type, thread_id){
    console.log('creating new firebase entry');

    //create new entry item in 'entries'
    var entries_REF=rootRef.child('entries');
    var fid=this.state.fid;
    var newEntryObject={
      fid:fid,
      thread_id:thread_id,
      title:false,
      created_date:Date.now(),
      updated_date:Date.now(),
      text:false
    };
    var newEntryId=entries_REF.push(newEntryObject).getKey();
    entries_REF.child(newEntryId).update({
      id:newEntryId
    });
    newEntryObject.id=newEntryId;
    console.log(newEntryId);

    //create new entry reference in 'threads'
    var threads_REF=rootRef.child('threads');
    var fid=this.state.fid;
    var newEntryReference={
      id:newEntryId,
      thread_id:thread_id,
      fid:fid
    };
    threads_REF.child(thread_id).child('entries').child(newEntryId).set(newEntryReference);

    //create new entry reference in local 'threads'
    var threads=this.state.threads;
    var thread=threads[thread_id];
    if(!thread.entries){
      thread.entries={};
    }
    threads[thread_id].entries[newEntryId]=newEntryReference;

    //create new entry item in local 'entries'
    var entries=this.state.entries;
    newEntryObject.transcript={};
    entries[newEntryId]=newEntryObject;

    this.setState({
      threads:threads,
      entries:entries,
      active_entry:newEntryId
    },function(){
      this.beginEntry(newEntryId);
    }.bind(this));
  }

  updateFirebaseEntry(entry_id){
    console.log('updating firebase entry');

    //update entry item in 'entries'
    var entries_REF=rootRef.child('entries');
    var entryObject=this.state.entries[entry_id];
    console.log(entry_id);
    console.log(entryObject);
    entries_REF.child(entry_id).set(entryObject);
    this.closeEntry();
  }

  deleteFirebaseEntry(entry_id){
    console.log('deleting firebase entry');

    //create new entry item in 'entries'
    var entries_REF=rootRef.child('entries');
    var fid=this.state.fid;
    entries_REF.child(entry_id).set(null);

    //create new entry reference in 'threads'
    var threads_REF=rootRef.child('threads');
    var thread_id=this.state.entries[entry_id].thread_id;
    threads_REF.child(thread_id).child('entries').child(entry_id).set(null);

    //create new entry reference in local 'threads'
    var threads=this.state.threads;
    var thread=threads[thread_id];
    delete threads[thread_id].entries[entry_id];

    //create new entry item in local 'entries'
    var entries=this.state.entries;
    delete entries[entry_id];

    this.setState({
      threads:threads,
      entries:entries,
      active_entry:false
    });
  }



/***************** Transcript Controller ******************/

  pass_final_transcript(final_transcript,overwrite){
      var convoHistory=this.state.convoHistory;
      if(this.state.active_entry){
        //store as entry
        var entries=this.state.entries;
        var entry=entries[this.state.active_entry];
        /*var transcriptLength=Object.keys(entry.transcript).length;
        //console.log("log"+String((transcriptLength+1)));
        if(overwrite){
          entry.transcript["log"+String(transcriptLength)].text=final_transcript;
          entry.transcript["log"+String(transcriptLength)].date=Date.now();
        }else{
          entry.transcript["log"+String(transcriptLength+1)]={};
          entry.transcript["log"+String(transcriptLength+1)].text=final_transcript;
          entry.transcript["log"+String(transcriptLength+1)].date=Date.now();
          entry.transcript["log"+String(transcriptLength+1)].id="log"+String(transcriptLength+1);
        }*/
        if(entry.text){
          entry.text += " "+final_transcript;
        }else{
          entry.text=final_transcript;
        }

        this.setState({
          entries:entries
        });
      }else{
        //store as convo
        if(overwrite){
          convoHistory[convoHistory.length-1].text=final_transcript;
        }else{
          convoHistory.push({id:convoHistory.length,text:final_transcript,type:'user',created_date:Date.now()});
        }
        this.setState({
          convoHistory:convoHistory
        });
      }
  }



/***************** PAGE CONTROLS ******************/

  toggleConvoHistory(e){
    this.setState({
      convoHistoryOpen:!this.state.convoHistoryOpen
    });
  }



/***************** PAGE RENDERING ******************/

  renderOnboarding(){
    if(!this.state.user.has_completed_intro && false){
      return(<Onboarding
        user={this.state.user}
      />);
    }
  }

  renderLogo(){
    var logo=logo_light;
    var textColor=false;
    var uiColor=false;
    if(this.state.active_thread){
      logo=(this.state.threads[this.state.active_thread].brightness > 230 ? logo_dark : logo_light);
    }
    var active_entry=(this.state.active_entry ? true : false);
    var active_color=(this.state.recoloring_thread_id ? true : false);
    return(<img id="logo" data-picking-color={active_color} data-active-entry={active_entry} data-convo-history-open={this.state.convoHistoryOpen} src={logo}/>);
  }

  renderLogin(){
    if(!this.state.fire_logged_in && this.state.login_visible){
      return(<Login
        facebookSignin={this.facebookSignin.bind(this)}
      />);
    }
  }

  renderLoggedInComponents(){
    if(this.state.fire_logged_in){
      return(<AppHome
        threads={this.state.threads}
      />);
    }
  }

  renderMicrophone(){
    if(this.state.microphoneVisible && this.state.fire_logged_in){
      return(
        <Microphone
          microphoneOn={this.state.microphoneOn}
          pass_final_transcript={this.pass_final_transcript.bind(this)}
        />
      );
    }
  }

  updateConvoInputHeight(height){
    this.setState({ convoInputHeight:height });
  }

  clearConvoInput(){
    setTimeout(function(){
      $('#convoInput').empty();
    },200);
  }

  convoInputKeydown(e){
    var height=e.currentTarget.clientHeight;
    this.updateConvoInputHeight(height);
  }

  convoInputKeydown(e){
    var code=(e.keyCode ? e.keyCode : e.which);
    if(code == 13) { //Enter keycode
      e.stopPropagation;
      e.preventDefault();
      var input=e.currentTarget;
      var text=input.textContent;
      if(text){
        if(this.state.active_entry){
          var entries=this.state.entries;
          var entry=entries[this.state.active_entry];
          var transcriptLength=Object.keys(entry.transcript).length;
          entry.transcript["log"+String(transcriptLength+1)]={};
          entry.transcript["log"+String(transcriptLength+1)].text=text;
          entry.transcript["log"+String(transcriptLength+1)].date=Date.now();
          entry.transcript["log"+String(transcriptLength+1)].id="log"+String(transcriptLength+1);
          input.innerHTML="";
          this.setState({
            entries:entries
          });
        }else{
          var convoHistory=this.state.convoHistory;
          convoHistory.push({id:convoHistory.length,text:text,type:'user'});
          input.innerHTML="";
          this.setState({
            convoHistory:convoHistory
          });
        }
      }
    }
  }

  renderConvoHistory(){
    if(this.state.convoHistoryVisible && this.state.fire_logged_in){
      var activeThreadColor=this.state.threads[this.state.active_thread].color;
      var convoStyle="default";
      var entryVisible=false;
      if(this.state.active_entry){
        convoStyle="entry";
        entryVisible=true;
      }
      return(
        <div id="convoHistoryContainer" data-style={convoStyle} data-open={this.state.convoHistoryOpen}>
          <div contentEditable="true" style={{color:activeThreadColor}} className="entryTitle" placeholder="Title..."></div>
          {this.renderConvoHistoryInner()}
          <div placeholder="type here..." onKeyDown={this.convoInputKeydown.bind(this)} onKeyUp={this.convoInputKeydown.bind(this)} id="convoInput" contentEditable="true"></div>
          <div id="convoHistoryButton" onClick={this.toggleConvoHistory.bind(this)}>
            <div className="level"></div>
            <div className="level"></div>
            <div className="level"></div>
          </div>
        </div>
      );
    }
  }

  renderConvoHistoryInner(){
    /*if(this.state.active_entry){
      return(<div id="entryHistory" style={{bottom:this.state.convoInputHeight}}>
        {Object.keys(this.state.entries[this.state.active_entry].transcript).map(this.renderEntryTranscriptItem.bind(this))}
      </div>);
    }else{*/
      return(<div id="convoHistory" style={{bottom:this.state.convoInputHeight}}>
        {this.state.convoHistory.map(this.renderConvoHistoryItem.bind(this))}
      </div>);
    //}
  }
  /*
  renderEntryTranscriptItem(item, i){
    var item=this.state.entries[this.state.active_entry].transcript["log"+String(i+1)];
    return(
      <div key={item.id} className="entryItem">
        {item.text+". "}
      </div>
    );
  }*/

  renderConvoHistoryItem(item, i){
    return(
      <div data-type={item.type} key={item.id} className="convoItem">
        {item.text}
      </div>
    );
  }


  /***************** THREADS ******************/



  toggleThreadMenu(e){
    e.preventDefault();
    e.stopPropagation();
    var el=e.currentTarget;
    var viewportOffset=el.getBoundingClientRect();
    // these are relative to the viewport, i.e. the window
    var left=viewportOffset.left;
    var width=e.currentTarget.offsetWidth;
    left+= width/2;
    this.setState({
      thread_menu_thread_id:el.parentNode.getAttribute('data-thread-id'),
      thread_menu_open:!this.state.thread_menu_open,
      thread_menu_left:left
    });
  }

  scrollThreads(){
    this.setState({
      thread_menu_open:false
    });
  }



  renderThreadsNav(){
    if(this.state.threads_nav_visible && this.state.fire_logged_in){
      return (
        <div id="threads_nav">
          {this.renderThreadMenu()}
          {this.renderThreads()}
          <div id="threadsCover"></div>
          <div onClick={this.createNewFirebaseThread.bind(this)} id="addThread">+</div>
        </div>
      );
    }
  }

  clickThreadMenu(e){
    e.stopPropagation();
  }

  renderThreadMenu(){
    var menuVisible=(this.state.thread_menu_open?true:false);
      return(
        <div id="threadMenuWrap" data-visible={menuVisible}>
          <div onClick={this.clickThreadMenu.bind(this)} style={{left:this.state.thread_menu_left}} id="threadMenu">
            <div onClick={this.clickDeleteThreadMenu.bind(this)} id="deleteThread">Delete</div>
            <div onClick={this.clickRenameThreadMenu.bind(this)} id="renameThread">Rename</div>
            <div onClick={this.beginRecolorThread.bind(this)} id="colorThread">Colors</div>
          </div>
        </div>
      );

  }

  renderThreads(){
    return (
      <div onScroll={this.scrollThreads.bind(this)} id="threads">
        {Object.keys(this.state.threads).map(this.renderEachThread.bind(this))}
      </div>
    );
  }

  renderEachThread(thread, i){
    var thread=this.state.threads[thread];
    var threadActive=(this.state.active_thread == thread.id ? true : false);
    var renamingThread=(this.state.renaming_thread_id == thread.id ? true : false);
    var thread_menu_visible=true;
    if(this.state.active_thread == "everything"){
      thread_menu_visible=false;
    }
    return (
      <div data-menu-visible={thread_menu_visible} onClick={this.clickThread.bind(this)} data-menu-open={this.state.thread_menu_open} data-active={threadActive} data-thread-id={thread.id} key={thread.id} className="thread">
        <div onClick={this.toggleThreadMenu.bind(this)} className="menu">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div onKeyDown={this.threadTitleKeydown.bind(this)} data-thread-id={thread.id} className="threadTitle" contentEditable={renamingThread} onBlur={this.blurRenameThread.bind(this)}>
          {thread.name}
        </div>
        <div style = {{opacity:'0',pointerEvents:'none'}} onKeyDown={this.threadTitleKeydown.bind(this)} data-thread-id={thread.id} className="threadTitleDummy" contentEditable={renamingThread}>
          {"Hi"}
        </div>
        <div style={{'background':thread.color}} className="threadColor"></div>
      </div>
    );
  }

  setThreadCookie(thread_id){
    cookie.save('thread_id', thread_id);
  }

  clickThread(e){
    $('#bottomGradient').removeClass('active');
    $('#entries').removeClass('active');
    e.stopPropagation();
    if(this.state.active_entry){
      this.finishEntry(this.state.active_entry);
    }
    this.showTopNav();
    if(e.currentTarget.getAttribute('data-active') == 'true'){
      this.setState({
        active_thread:"everything",
        thread_menu_open:false,
        recoloring_thread_id:false,
        entries_loaded:false
      },function(){
        this.getFirebaseEntryData();
      });
    }else{
      var thread_id=e.currentTarget.getAttribute('data-thread-id');
      this.setState({
        active_thread:thread_id,
        thread_menu_open:false,
        recoloring_thread_id:false
      },function(){
        this.getFirebaseEntryData();
        this.setThreadCookie(thread_id);
      });
    }
  }

  threadTitleKeydown(e){
    var code=(e.keyCode ? e.keyCode : e.which);
    if(code == 13) { //Enter keycode
      e.preventDefault();
      document.activeElement.blur();
    }
  }

  clickDeleteThreadMenu(e){
    this.showTopNav();
    console.log('deleting firebase thread');
    var thread_id=this.state.thread_menu_thread_id;
    this.deleteFirebaseThread(thread_id);
  }

  clickRenameThreadMenu(e){
    console.log('renaming firebase thread');
    var thread_id=this.state.thread_menu_thread_id;
    this.beginRenameThread(thread_id);
  }

  beginRenameThread(thread_id){
    this.setState({renaming_thread_id:thread_id,thread_menu_open:false},function(){
      setTimeout(function(){
        $('.threadTitle[data-thread-id="'+thread_id+'"]').focus();
        document.execCommand('selectAll', false, null);
      },200);
    }.bind(this));
  }

  blurRenameThread(e){
    var name=e.currentTarget.textContent;
    var thread_id=this.state.renaming_thread_id;
    if(name != ""){
      name=ucFirstAllWords(name);
      this.renameFirebaseThread(thread_id, name);
    }else{
      e.currentTarget.innerHTML = this.state.threads[thread_id].name;
    }
  }



/***************** COLOR PICKER ******************/

  beginRecolorThread(){
    this.setState({recoloring_type:"thread",recoloring_thread_id:this.state.active_thread,thread_menu_open:false});
  }

  closeColorPicker(){
    this.setState({
      recoloring_thread_id:false
    });
  }

  renderColorPicker(){
    if(this.state.recoloring_thread_id && this.state.fire_logged_in){
      var thread_id=this.state.recoloring_thread_id;
      var type=this.state.recoloring_type;
      if(type == "thread"){
        return(<ColorPicker
          type={type}
          thread_id={thread_id}
          currentColor={this.state.threads[thread_id].color}
          setNewColor={this.setNewColor.bind(this)}
          closeColorPicker={this.closeColorPicker.bind(this)}
        />);
      }else if(type == "entry"){
        var entry_id=this.state.recoloring_entry_id;
        return(<ColorPicker
          type={type}
          entry_id={entry_id}
          currentColor={this.state.threads[this.state.recoloring_thread_id].color}
          setNewColor={this.setNewColor.bind(this)}
          closeColorPicker={this.closeColorPicker.bind(this)}
        />);
      }
    }
  }

  setNewColor(type,id,color,textColor,uiColor,brightness){
    if(type == "thread"){
      this.recolorFirebaseThread(type,id,color,textColor,uiColor,brightness);
    }else if(type == "entry"){

    }
  }


/***************** THREAD PAGE ******************/



  showTopNav(){
    this.setState({
      topNavHidden:false
    });
  }

  hideTopNav(){
    this.setState({
      topNavHidden:true
    });
  }


  renderThreadPage(new_color){
    if(this.state.active_thread && this.state.fire_logged_in){
      var active_thread_entries={};
      //console.log('**************');
      //console.log(this.state.threads[this.state.active_thread].entries);
      var active_thread_entries_refs=this.state.threads[this.state.active_thread].entries;
      var thread_has_entries=false;
      var entries_are_loaded=false;
      var entry_data=false;
      if(this.state.active_entry){
        entry_data=this.state.entries[this.state.active_entry];
      }
      if(this.state.threads[this.state.active_thread].entries && Object.keys(this.state.threads[this.state.active_thread].entries).length > 0){
        thread_has_entries=true;
        Object.keys(active_thread_entries_refs).forEach(function (key) {
          //console.log('inserting an entry');
          //console.log(key);
          //console.log(this.state.entries[key]);
          if(this.state.entries[key]){
            active_thread_entries[key]=this.state.entries[key];
            entries_are_loaded=true;
          }else{
            console.log('couldnt find entry');
            entries_are_loaded=false;
          }
        }.bind(this));

      }
      /*console.log('**************');
      console.log(this.state.entries_loaded);
      console.log(thread_has_entries);
      console.log(Object.keys(this.state.entries).length);*/

      return(<Thread
        showTopNav={this.showTopNav.bind(this)}
        hideTopNav={this.hideTopNav.bind(this)}
        new_color={new_color}
        logout={this.logout.bind(this)}
        saveEntryEdit={this.saveEntryEdit.bind(this)}
        deleteEntry={this.deleteEntry.bind(this)}
        entries_are_loaded={entries_are_loaded}
        thread_has_entries={thread_has_entries}
        active_thread_data={this.state.threads[this.state.active_thread]}
        user={this.state.user}
        entries_loaded={this.state.entries_loaded}
        threads={this.state.threads}
        active_thread={this.state.active_thread}
        active_thread_id={this.state.active_thread}
        newEntry={this.newEntry.bind(this)}
        finishEntry={this.finishEntry.bind(this)}
        active_entry={this.state.active_entry}
        active_thread_entries={active_thread_entries}
        updateEntry={this.updateEntry.bind(this)}
        entry_data={entry_data}
      />);
    }
  }

  newEntry(type){
    console.log('starting new entry');
    var thread_id=this.state.active_thread;
    this.createNewFirebaseEntry(type,thread_id);
  }

  finishEntry(entry_id){
    console.log('finishing entry');
    //check for empty entry, if so, delete entry
    if(this.state.entries[entry_id].text){
      this.updateFirebaseEntry(entry_id);
    }else{
      this.deleteEntry(entry_id);
    }
  }

  closeEntry(){
    this.updateConvoInputHeight(90);
    this.setState({
      active_entry:false
    });
    clearTimeout(window.bottomGradientTimer);
    window.bottomGradientTimer=setTimeout(function(){
      $('#bottomGradient').addClass('active');
      $('#entries').addClass('active');
    },200);
  }

  updateEntry(entry_id, entry_data){
    var entries=this.state.entries;
    var entry=entries[entry_id];
    entry.text=entry_data.text;
    entry.title=entry_data.title;
    this.setState({
      entries:entries
    },function(){
      //this.updateFirebaseEntry(entry_id);
    });
  }

  saveEntryEdit(entry_id,text, title){
    var entry_data=this.state.entries[entry_id];
    entry_data.text=text;
    entry_data.title=title;
    this.updateEntry(entry_id,entry_data);
    this.updateFirebaseEntry(entry_id);
  }

  deleteEntry(entry_id){
    console.log(entry_id);
    this.deleteFirebaseEntry(entry_id);
  }

  beginEntry(entry_id){
    this.setState({
      active_entry:entry_id
    }, function(){
      setTimeout(function(){
        $('#newEntryContainer .entryInput').focus();
      },0);
    });
  }






  appClick(e){
    if(this.state.thread_menu_open){
      this.setState({
        thread_menu_open:false
      })
    }
  }

  render() {
    var textColor=false;
    var uiColor=false;
    var trayColor=false;
    if(this.state.active_thread){
      textColor=(this.state.threads[this.state.active_thread].brightness > 160 ? "dark" : "light");
      uiColor=(this.state.threads[this.state.active_thread].brightness > 230 ? "dark" : "light");
      trayColor=(this.state.threads[this.state.active_thread].brightness > 100 ? "dark" : "light");
    }
    //var color=(this.state.active_thread ? hexToRgb(this.state.threads[this.state.active_thread].color) : false);
    //var activeThreadColor='radial-gradient(ellipse at top center, rgba('+color.r+','+color.g+','+color.b+',.7) 0%, rgba('+color.r+','+color.g+','+color.b+',1) 100%)';

    var activeThreadColor=this.state.threads[this.state.active_thread].color;
    var photoBG="transparent";
    var bgImageToLoad='url("http://cdn.mysitemyway.com/etc-mysitemyway/webtreats/assets/posts/857/full/tileable-classic-nebula-space-patterns-6.jpg")';
    clearTimeout(window.fadeBgIn);
    var new_color=activeThreadColor;
    if(this.state.active_thread=='everything'){
      activeThreadColor='transparent';
      new_color="#ffffff";
      /*if(window.prevBackground){
        window.fadeBgIn = setTimeout(function(){
          $('.AppInner').css('background','#de5e5e');
        },0);
        window.fadeBgOut = setTimeout(function(){
          $('.App').css('background','transparent');
          $('.AppInner').addClass('fading').css('background','transparent');
        },400);
      }*/
    }else{

    }
    /*
    if(window.prevBackground){
      photoBG=window.prevBackground;
      clearTimeout(window.clearBgTimeout);
      window.clearBgTimeout = setTimeout(function(){
        window.prevBackground=false;
      },400);
    }

    if(this.state.threads[this.state.active_thread].name.toLowerCase().includes('dream')){
      activeThreadColor='#001';
      window.prevBackground=bgImageToLoad;
      new_color=activeThreadColor;
      textColor="light";
      uiColor="light";
      trayColor="light";
      window.fadeBgIn = setTimeout(function(){
        $('.App').css('background',bgImageToLoad);
        $('.AppInner').addClass('fading').css('background','transparent');
      },400);
      photoBG=bgImageToLoad;
    }else{
    }
    */

    var active_entry=(this.state.active_entry ? true : false);
    return (
      <div className="App" data-top-nav-hidden={this.state.topNavHidden} data-tray-color={trayColor} data-ui-color={uiColor} data-text-color={textColor} onClick={this.appClick.bind(this)} style={{background:photoBG}} data-active-entry={active_entry} data-convo-history-open={this.state.convoHistoryOpen} data-threads-open={this.state.threads_nav_visible}>
        {this.renderLogo()}
        <div className="AppInner" style={{background:activeThreadColor}}>
          {this.renderColorPicker()}
          {this.renderMicrophone()}
          {this.renderConvoHistory()}
          {this.renderLogin()}
          {this.renderOnboarding()}
          {this.firebaseUserUpdateObject()}
          {this.renderThreadsNav()}
          {this.renderThreadPage(new_color)}
        </div>
      </div>
    );
  }
}

export default App;
