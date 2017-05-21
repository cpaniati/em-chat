import React, { PropTypes, Component } from 'react';
import cookie from 'react-cookie';
import logo_light from './logo_light_shadow.svg';
import em_bounce from './em-bounce.gif';
import logo_dark from './logo_dark.svg';
import em_audio1 from './em_audio1.mp3';
import em_tone1 from './em_tone2.1.mp3';
import em_tone2 from './em_tone2.2.mp3';
import em_tone3 from './em_tone2.3.mp3';
import em_tone4 from './em_tone2.4.mp3';
import em_tone5 from './em_tone2.5.mp3';
import em_tone6 from './em_tone2.6.mp3';
import em_tone7 from './em_tone2.7.mp3';
import em_tone8 from './em_tone2.8.mp3';
import em_tone9 from './em_tone2.9.mp3';
import em_tone10 from './em_tone2.10.mp3';
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
//import Snap from 'snapsvg';
//window.snap = require('snapsvg');
//window.snap = require( "imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js" );
//import Snap from './snap.svg.js';
//import Snap from './snap.svg.js';
//import {ApiAiClient, ApiAiStreamClient} from "./api-ai.js";

var accessToken = "d42fac059d4c46b8af673d2e0fc7ff15";
var baseUrl = "https://api.api.ai/v1/";





/*const client = new ApiAiClient({accessToken: 'YOUR_ACCESS_TOKEN', streamClientClass: ApiAiStreamClient});
setTimeout(function(){
  client.textRequest('Hello!')
      .then((response) => {console.log(response); alert('response!')})
      .catch((error) => {});
},10000);*/



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

function getFirstWord(str) {
        if (str.indexOf(' ') === -1)
            return str;
        else
            return str.substr(0, str.indexOf(' '));
    };

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

var onboarding_tooltips = {"microphone":{"text":"Click to turn on your microphone"},"openConvoHistory":{"text":"Click to open your conversation history"},"closeConvoHistory":{"text":"Click to close your conversation history"},"newThread":{"text":"Click (+) to make a new thread"},"typeInName":{"text":"Type here to rename the thread."},"editColor":{"text":"Hover over the thread and click the ... to open the thread menu."},"clickColor":{"text":"Click *colors*"},"newEntry":{"text":"Click to make a new entry"}};

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
  login_visible:false,
  face_logged_in:false,
  fire_logged_in:false,
  active_thread:"user",
  threads:{"user":{id:"user",name:"Loading...",color:"#FF7878",brightness:150},"everything":{id:"everything",name:"Everything",color:"#FF7878",brightness:150,entries:{}}},
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
  topNavHidden:false,
  microphoneOn:false,
  mainMenuVisible:false,
  playEmExpression:false,
  tooltip:false,
  onboarding_position:false
};





class App extends Component {

  constructor(){
    //var active_thread=(cookie.load('thread_id') ? cookie.load('thread_id') : "everything");
    super();
    this.state={
      login_visible:false,
      face_logged_in:false,
      fire_logged_in:false,
      active_thread:"user",
      threads:{"user":{id:"user",name:"Loading...",color:"#FF7878",brightness:150},"everything":{id:"everything",name:"Everything",color:"#FF7878",brightness:150,entries:{}}},
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
      topNavHidden:false,
      microphoneOn:false,
      mainMenuVisible:false,
      playEmExpression:false,
      tooltip:false,
      onboarding_position:false
    };
  }

  componentWillMount(){
    this.setState({rootRef:rootRef});
    this.checkForLoginCookie();

    //detect if browser tab is active or inactive
    //window.onfocus=this.userReturnedToPage.bind(this);
    //window.onblur=this.userLeftPage.bind(this);

    document.addEventListener("keydown", this.pageKeyDown.bind(this));
    document.addEventListener("keyup", this.pageKeyUp.bind(this));
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

    window.emAnimationPlaying=false;

  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.pageKeyDown.bind(this));
    document.removeEventListener("keyup", this.pageKeyUp.bind(this));
  }

  renderEmContainer(){
    var highlightColor = (this.state.active_thread!="everything"?this.state.threads[this.state.active_thread].color:"#ff9e9e");
    if(this.state.fire_logged_in){
      var emFill = "white";
      if(this.state.emTalking){
        emFill = "#ffc";
      }
      return(
        <svg id="em_container">
           <circle id="em_body" cx={20} cy={20} r={20} fill={emFill} />
           <circle id="em_highlight" cx={30} cy={10} r={2} fill={highlightColor} />
         </svg>);
    }
  }

  renderEmSpeechBubble(){
    if(this.state.fire_logged_in){
      return(
        <div id="emResponses">
        </div>);
    }
  }

  renderEmAnimation(){
    if(this.state.playEmExpression){
      console.log('playing em expression');
      return(
        <div id="emExpression" style={{display:'none'}}><img src={em_bounce} width="240px"/>
        </div>);
    }
  }

  setEmBounds(position){
    if(position == "left"){
      window.emBoxTop=-30;
      window.emBoxBottom=30;
      window.emBoxLeft=-30;
      window.emBoxRight=300;
    }else if(position == "center"){
      window.emBoxTop=-30;
      window.emBoxBottom=window.pageHeight-400;
      window.emBoxLeft=window.pageWidth/4;
      window.emBoxRight=window.pageWidth-window.pageWidth/4;
    }else if(position == "farLeft"){
      window.emBoxTop=-30;
      window.emBoxBottom=30;
      window.emBoxLeft=-30;
      window.emBoxRight=300;
    }
  }

  launchEMBubble(){

    //****************** EM BUBBLE *********************//

    window.em_radar_speed = 2000;
    window.em_speed = 5;
    window.em_gravity = window.em_speed*.02;
    window.em_xPos = 0;
    window.em_yPos = 0;

    var xPos = window.em_xPos;
    var yPos = window.em_yPos;
    var emSpeed = window.em_speed;
    var radarSpeed = window.em_radar_speed;
    var currentMood = 'neutral';


  	window.pageHeight = $(window).height();
  	window.pageWidth = $(window).width();

  	$(window).resize(function(){
  		window.pageHeight = $(window).height();
  		window.pageWidth = $(window).width();
      if(window.pageWidth < 901){
        this.setEmBounds("farLeft");
      }
  	}.bind(this));

  	//em.transform("t"+pageWidth/3+","+pageHeight/3);


  	var minVal = -.2;
  	var maxVal = .2;
  	var direction = 0;
  	var rInertia = 0;
  	var radars = [];
  	var radarsData = [];

    window.emBoxTop=-30;
    //window.emBoxBottom=30;
    window.emBoxBottom=window.pageHeight-400;
    window.emBoxLeft=-30;
    //window.emBoxRight=300;
    window.emBoxRight=window.pageWidth/2-200;
    console.log(window.emBoxRight);


    /*
  	var counter = 0;
  	window.radarBlinker = function(){
  			var object = {width:0,height:0,opacity:.2};
  			radarsData.push(object);
  			counter++;
  			var radarObj = sr.circle(xPos+200, yPos+200, 1);
  			radarObj.attr({
  					fill: "#FF9E9E",
  					opacity:.1,
  					id:"radar"+counter
  			});

  			$('#radar'+counter).addClass("emRadar "+currentMood);

  			radars[radars.length] = radarObj;

  			radarObj.animate({ transform: "s"+1000+" "+1000, opacity:0}, 10000 );

  	}*/
  	//window.radarBlink = setInterval(window.radarBlinker, radarSpeed);
      clearInterval(window.emMovement);
  	  window.emMovement = setInterval(function(){

      var em=$('#em_container');

      if(this.state.playEmExpression){
        if(this.state.emWhichExpression == "dance"){
          if(!window.emAnimationPlaying){
            var emSprite = $('#emExpression');
            emSprite.css("top",(yPos+60)+"px");
            emSprite.css("left",(xPos+103)+"px");
            emSprite.css('display','block');
            em.css('display','none');


            new Audio(em_audio1).play();


            setTimeout(function(){
              this.setState({playEmExpression:false});
              window.emAnimationPlaying=false;
              em.css('display','block');
            }.bind(this),3000);
            window.emAnimationPlaying=true;
          }
        }else if(this.state.emWhichExpression == "one"){
          new Audio(em_tone1).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "two"){
          new Audio(em_tone2).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "three"){
          new Audio(em_tone3).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "four"){
          new Audio(em_tone4).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "five"){
          new Audio(em_tone5).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "six"){
          new Audio(em_tone6).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "seven"){
          new Audio(em_tone7).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "eight"){
          new Audio(em_tone8).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "nine"){
          new Audio(em_tone9).play();
          this.setState({playEmExpression:false,emTalking:true});
        }else if(this.state.emWhichExpression == "ten"){
          new Audio(em_tone10).play();
          this.setState({playEmExpression:false,emTalking:true});
        }
        setTimeout(function(){
          this.setState({emTalking:false});
        }.bind(this),1500);

      }else{

  		var rChange = Math.random()*.2-.1;
  		rInertia += rChange;
  		direction += rInertia;
  		//console.log('r:'+rInertia+' d:'+direction+' x:'+xPos+' y:'+yPos);

      var top = window.emBoxTop;
      var bottom = window.emBoxBottom;
      var left = window.emBoxLeft;
      var right = window.emBoxRight;
      var gravity = window.em_gravity;

      //console.log(xPos);
  		if(xPos < left){
  			xPos += (xPos-left)*-gravity;
  		}else if (xPos > right){
  			xPos -= (xPos-right)*gravity;
  		}
      //console.log(yPos);
  		if(yPos < top){
  			yPos += (yPos-top)*-gravity;
  		}else if (yPos > bottom){
  			yPos -= (yPos - bottom)*gravity;
  		}
  		xPos += Math.sin(direction)*emSpeed;
  		yPos += Math.cos(direction)*emSpeed;

  		//emHighlight.animate({ transform: "t"+(2-((xPos+200) * 6 - (yPos)*2)/150).toFixed(2)+" "+(-((xPos+200) * 6 - (yPos)*2)/300).toFixed(2)}, 200 );

  		if(rInertia > maxVal){
  			rInertia = maxVal;
  		}else if(rInertia < minVal){
  			rInertia = minVal;
  		}

      //console.log(xPos+', '+yPos);
        em.css("transform","translate3d("+(xPos+200)+"px, "+(yPos+200)+"px, 0px)");
        $('#emResponses').css("transform","translate3d("+(xPos+240)+"px, "+(yPos+240)+"px, 0px)");
      }
  	}.bind(this),200);



    /*
  	var emRadarGen = setInterval(function(){
			for(var i=0;i<radars.length;i++){

  			radarsData[i].width+=20;
  			radarsData[i].height+=20;
  			radarsData[i].opacity-=.005;
  			if(Number(radarsData[i].width) > 1000){
  				radarsData.splice(i,1);
  				//console.log(sr.select("#"+radars[i].id));
  				sr.select("#"+radars[i].node.id).removeData();
  				sr.select("#"+radars[i].node.id).remove();
  				//console.log(radars[i].node.id);
  				radars.splice(i,1);
  				return;
  			}
			}
		},200);*/

  }

  componentDidUpdate(){

  }



/***************** USER PAGE EVENTS ******************/

userReturnedToPage(){
  /*if(this.state.microphoneOn){
    this.state.recognition.stop();
    this.state.recognition.start();
  }*/
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
        this.setState(window.initialState,function(){
          this.componentWillMount();
          this.componentDidMount();
        }.bind(this));
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
    //setup user main thread
    var threads = this.state.threads;
    var everything_thread = threads["everything"];
    var user_everything_thread_id = fid+"-everything";
    threads[user_everything_thread_id] = everything_thread;
    threads[user_everything_thread_id].id=user_everything_thread_id;
    delete threads["everything"];
    this.setState({threads:threads});

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
        threads["user"].name=user.name.split(" ")[0];
        threads[user_everything_thread_id].name="Everything";
        this.setState({
          fid:fid,
          fire_logged_in:true,
          user:user,
          threads:threads,
          user_everything_thread_id:user_everything_thread_id
        }, function(){
          var threads_REF=rootRef.child('threads');
          var threadReferences=this.state.user.threads;
          var user_everything_thread_id=fid+"-everything";
          if(!threadReferences[user_everything_thread_id]){
            this.createUserThread(fid);
          }else{
            this.getFirebaseThreadData(fid);
          }
          this.launchEMBubble();
          if(user.name.split(" ")[0]=='Bailey' || user.name.split(" ")[0]=='bailey'){
            this.startIntroDialog();
          }
        });
      }
    });
  }

  startIntroDialog(){
    console.log('starting intro dialog');
    this.setState({onboarding_position:1}, function(){
      this.nextIntroDialog();
    }.bind(this));
  }

  nextIntroDialog(data){
    console.log('next intro dialog');
    if(this.state.onboarding_position==1){
      var name = getFirstWord(this.state.user.name);
      this.em_speak("Hi "+name+"! I’m Em, its great to meet you. :)",2500);
      this.em_speak("Go ahead and click the circle icon in the bottom right corner so you can talk to me using your voice.",5000);
      setTimeout(function(){
        this.show_tooltip('microphone');
      }.bind(this),7000);
    }else if(this.state.onboarding_position==2){
      this.hide_tooltip();
      //this.em_speak("You may have to click *Allow Microphone Access*");
      this.em_speak("Go ahead and start speaking and I'll let you know if I can hear you.",2500);
      this.em_speak("You can see a transcript of what I'm hearing next to the microphone button.",6000);
    }else if(this.state.onboarding_position==3){
      this.hide_tooltip();
      this.em_speak("Nice, so I can hear you now!");
      this.em_speak("You'll be able to see a log of what we've said in the convo history.",2500);
      this.em_speak("Go ahead and check it out.",4000);
      setTimeout(function(){
        this.show_tooltip('openConvoHistory');
      }.bind(this),3500);
    }else if(this.state.onboarding_position==4){
      this.hide_tooltip();
      this.em_speak("You can always come back here and scroll to see what we've talked about.");
      this.em_speak("Click the convo history button again to close it.",3500);
      setTimeout(function(){
        this.show_tooltip('closeConvoHistory');
      }.bind(this),3500);
    }else if(this.state.onboarding_position==5){
      this.hide_tooltip();
      this.em_speak("Okay great. Now I want to get to know you a little bit.");
      this.em_speak("Let's see...",3500);
      this.em_speak("Can you tell me about someone in your life that you are close with?",5000);
    }else if(this.state.onboarding_position==6){
      this.em_speak("Okay, this sounds like someone important. You should make a new thread for them!");
      setTimeout(function(){
        this.show_tooltip('newThread');
      }.bind(this),3500);
    }else if(this.state.onboarding_position==7){
      this.hide_tooltip();
      this.em_speak("Nice! You should see a new thread down at the bottom left called 'New Thread.'");
      this.em_speak("Go ahead and type in the name of the person you were telling me about.",4000);
      setTimeout(function(){
        this.show_tooltip('typeInName');
      }.bind(this),4000);
    }else if(this.state.onboarding_position==8){
      this.hide_tooltip();
      this.em_speak("Awesome, so now you've got a thread for "+data);
      this.em_speak("Anytime you mention them I'll make sure to include it here in this thread. That way you can keep track of your relationship.",4000);
      this.em_speak("Hmm.. that gray doesn't quite feel like "+data+" does it?",11000);
      this.em_speak("Let's pick a new color for "+data+"'s thread!",15000);
      setTimeout(function(){
        this.show_tooltip('editColor');
      }.bind(this),12000);
    }else if(this.state.onboarding_position==9){
      this.show_tooltip('clickColor');
      this.em_speak("Click *color* to edit the color for this thread.");
    }else if(this.state.onboarding_position==10){
      this.hide_tooltip();
      this.em_speak("So which color feels right for them? Pick one and click on it!",2000);
      setTimeout(function(){
        if(this.state.onboarding_position==10){
          this.em_speak("What comes to mind when you think of them? Maybe the color of a favorite food, or a place you two spend time together?");
        }
      }.bind(this),7500);
    }else if(this.state.onboarding_position==11){
      this.hide_tooltip();
      this.em_speak("Ooo I love this color!",2000);
      setTimeout(function(){
        this.setState({emWhichExpression:"dance", playEmExpression:true});
      }.bind(this),2000);
      this.em_speak("Okay, the last thing I wanted to show you is how to make a new journal entry!",9000);
      this.em_speak("Click the [+] button in the top right to make a new entry.",12000);
      setTimeout(function(){
        this.show_tooltip('newEntry');
      }.bind(this),12000);
    }else if(this.state.onboarding_position==12){
      this.hide_tooltip();
      var name = this.state.threads[this.state.active_thread].name;
      this.em_speak("So this is a new entry for "+name+".",3000);
      this.em_speak("Why don't you talk a little bit about a favorite memory that you have with "+name+".",5000);
      this.em_speak("If you don't feel like talking out loud you can always click in the entry and type.",12000);
      this.em_speak("Go ahead and talk as long as you'd like. When you're finished click [done] and I'll save this in "+name+"'s thread.",19000);
      this.em_speak("Finally, if you need to ask me anything while you're journaling, just hold down the [Command] key and talk to me and I'll respond.",27000);
    }
  }

  show_tooltip(tooltip){
      this.setState({tooltip:tooltip});
  }

  hide_tooltip(){
    this.setState({tooltip:false});
  }

  renderTooltip(){
    if(this.state.tooltip!=false){
      var tooltip = this.state.tooltip;
      return (
        <div key="tooltip" id="onboarding_tooltip" data-tooltip-position={tooltip}>
          {onboarding_tooltips[tooltip].text}
        </div>
      );
    }
  }

  getFirebaseThreadData(fid){
    var threads_REF=rootRef.child('threads');
    var threadReferences=this.state.user.threads;
    console.log(threadReferences);
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
        console.log(thread);
        if( thread === null ) {
          //set up the new user profile
          console.log('Thread not found in Firebase>Threads –– Issue!');
        }else{
          threads[thread.id]=thread;
        }
        if(i == Object.keys(threadReferences).length){
          this.setState({
            threads:threads
          }, function(){
            this.getFirebaseEntryData();
          });
        }
      });
    }
  }

  createUserThread(fid){
    var user_everything_thread_id=fid+"-everything";
    var user_REF=rootRef.child('users').child(fid);
    user_REF.child('threads').child(user_everything_thread_id).set({id:user_everything_thread_id},this.getFirebaseThreadData(fid));
    var threads_REF=rootRef.child('threads');
    threads_REF.child(user_everything_thread_id).set(this.state.threads[user_everything_thread_id]);
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
    console.log('getting firebase entry data for: '+this.state.active_thread);
    console.log(this.state.threads);
    var entries_REF=rootRef.child('entries');
    var entryReferences=this.state.threads[this.state.active_thread].entries;
    console.log(this.state.threads[this.state.active_thread]);
    console.log(entryReferences);
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
    //setup user main thread
    var fid = newId;
    var threads = this.state.threads;
    var everything_thread = threads["everything"];
    var user_everything_thread_id = fid+"-everything";
    threads[user_everything_thread_id] = everything_thread;
    threads[user_everything_thread_id].id=user_everything_thread_id;
    delete threads["everything"];
    this.setState({active_thread:user_everything_thread_id,threads:threads});

    console.log('setting up new user data:');
    var user_REF=rootRef.child('users');
    var new_user_data={
      has_completed_intro:false,
      name:this.state.fb_user.displayName,
      email:this.state.fb_user.email,
      photo_url:this.state.fb_user.photoURL
    };
    new_user_data.threads={};
    new_user_data.threads[user_everything_thread_id]=this.state.threads[user_everything_thread_id];
    new_user_data.sign_up_date=Date.now();
    new_user_data.last_login=Date.now();
    new_user_data.fid=newId;
    new_user_data.fb_refreshToken=this.state.fb_user.refreshToken;
    new_user_data.fb_token=this.state.fb_token;
    console.log(new_user_data);
    this.createFirebaseUserCookie(newId);
    this.userDataUpdated=true;
    var threads=this.state.threads;
    threads["user"].name=name.split(" ")[0];
    threads[user_everything_thread_id].name="Everything";
    this.setState({
      user:new_user_data,
      fid:newId,
      fire_logged_in:true,
      threads:threads,
      user_everything_thread_id:user_everything_thread_id
    },function(){
      this.launchEMBubble();
      this.startIntroDialog();
    }.bind(this));
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

  createNewFirebaseThread(name){
    //check for active entry, if so finish & close entry
    if(this.state.active_entry){
      this.finishEntry(this.state.active_entry);
    }

    if(!name){
      name = "New Thread";
    }
    console.log('creating new firebase thread:');

    //create new item in threads
    var threads_REF=rootRef.child('threads');
    var fid=this.state.fid;
    var newThreadObject={
      fid:fid,
      name:name,
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
      this.setEmBounds("left");
      if(this.state.onboarding_position==6){
        this.setState({onboarding_position:7},function(){
          this.nextIntroDialog();
        }.bind(this));
      }
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
      active_thread:"user",
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
      title:false,
      created_date:Date.now(),
      updated_date:Date.now(),
      text:false
    };
    if(thread_id!='everything'){
      newEntryObject.threads={};
      newEntryObject.threads[thread_id]=thread_id;
    }
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

  addFirebaseEntryThreadRef(entry_id, thread_id){

    //create new entry reference in 'threads'
    var thread_id;
    var threads_REF=rootRef.child('threads');
    var fid=this.state.fid;
    var newEntryReference={
      id:entry_id,
      thread_id:thread_id,
      fid:fid
    };
    threads_REF.child(thread_id).child('entries').child(entry_id).set(newEntryReference);

    //create new entry reference in local 'threads'
    var threads=this.state.threads;
    var thread=threads[thread_id];
    if(!thread.entries){
      thread.entries={};
    }
    threads[thread_id].entries[entry_id]=newEntryReference;

    this.setState({threads:threads});
  }

  deleteFirebaseEntryThreadRef(entry_id, thread_id){
    var threads_REF=rootRef.child('threads');
    threads_REF.child(thread_id).child('entries').child(entry_id).set(null);

    var threads=this.state.threads;
    var thread=threads[thread_id];
    if(thread.entries){
      delete threads[thread_id].entries[entry_id];
    }
    this.setState({threads:threads});

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

    var entryThreadRefs = this.state.entries[entry_id].threads;
    entryThreadRefs[this.state.user_everything_thread_id]=this.state.user_everything_thread_id;
    if(entryThreadRefs){
      var threadsKeys = Object.keys(entryThreadRefs);
      console.log('threads length:'+threadsKeys.length);

      for(var i = 0; i<threadsKeys.length;i++){
        var thread_id=threadsKeys[i];
        this.addFirebaseEntryThreadRef(entry_id, thread_id);
      }
    }
  }

  deleteFirebaseEntry(entry_id){
    console.log('deleting firebase entry');

    //create new entry item in 'entries'
    var entries_REF=rootRef.child('entries');
    var fid=this.state.fid;
    entries_REF.child(entry_id).set(null);

    var threadsKeys = Object.keys(this.state.threads);

    for(var i = 0; i<threadsKeys.length;i++){
      var thread_id=threadsKeys[i];
      this.deleteFirebaseEntryThreadRef(entry_id, thread_id);
    }

    /*
    //create new entry reference in 'threads'
    var threads_REF=rootRef.child('threads');
    var thread_id=this.state.entries[entry_id].thread_id;
    threads_REF.child(thread_id).child('entries').child(entry_id).set(null);

    //create new entry reference in local 'threads'
    var threads=this.state.threads;
    var thread=threads[thread_id];
    delete threads[thread_id].entries[entry_id];*/

    //create new entry item in local 'entries'
    var entries=this.state.entries;
    delete entries[entry_id];

    this.setState({
      entries:entries,
      active_entry:false
    });
  }



/***************** Transcript Controller ******************/

  pass_final_transcript(final_transcript,overwrite){
      var convoHistory=this.state.convoHistory;
      console.log(this.state.mic_location);
      if(this.state.mic_location=='entry' && this.state.active_entry && window.emIsWaitingForTranscript!=true){
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
        if(final_transcript.includes("dance") || Math.random() > .93){
          this.setState({emWhichExpression:"dance", playEmExpression:true});
        }
        //store as convo
        window.emIsWaitingForTranscript=false;
        if(overwrite){
          convoHistory[window.lastUserConvoItem].text=final_transcript;
        }else{
          window.lastUserConvoItem=convoHistory.length;
          convoHistory.push({id:convoHistory.length,text:final_transcript,type:'user',created_date:Date.now()});
        }
        this.setState({
          convoHistory:convoHistory
        });
        //send the text to API.ai for conversion
        if(this.state.onboarding_position!=5 && this.state.onboarding_position!=6){
          this.send_Api_Ai(final_transcript);
        }

        if(this.state.onboarding_position==2){
          setTimeout(function(){
            this.setState({onboarding_position:3},function(){
              this.nextIntroDialog();
            });
          }.bind(this),2000);
        }else if(this.state.onboarding_position==5){
          setTimeout(function(){
            this.setState({onboarding_position:6},function(){
              this.nextIntroDialog();
            });
          }.bind(this),2000);
        }
      }
  }

  pageKeyDown(e){
    //var code=(e.keyCode ? e.keyCode : e.which);
    console.log('hit');
    if(e.metaKey) { //Enter keycode
      this.refs.microphone.toggleMicAnimation(true);
      window.prevMicState=this.state.microphoneOn;
      window.prevMicLocation=this.state.mic_location;
      window.emIsWaitingForTranscript=true;
      if(!this.state.microphoneOn){
        this.refs.microphone.startRecognition();
      }
      this.setState({mic_location:"convo",emButtonIsPressed:true,microphoneOn:true});
    }
  }

  pageKeyUp(e){
    if(this.state.emButtonIsPressed){
      this.refs.microphone.toggleMicAnimation(window.prevMicState);
      this.setState({mic_location:window.prevMicLocation,emButtonIsPressed:false,microphoneOn:window.prevMicState});
      if(window.prevMicState == false){
        this.refs.microphone.stopRecognition();
      }
    }
  }


  send_Api_Ai(text) {
  			$.ajax({
  				type: "POST",
  				url: baseUrl + "query?v=20150910",
  				contentType: "application/json; charset=utf-8",
  				dataType: "json",
  				headers: {
  					"Authorization": "Bearer " + accessToken
  				},
  				data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
  				success: function(data) {
            console.log(data);
            var action = data.result.action;
            var parameters = data.result.parameters;
            if(action){
              this.checkActions(action, parameters);
            }
            var text = data.result.fulfillment.speech;

            if(!window.emAnimationPlaying){
              var whichClip = Math.random();
              if(text.length < 15){
                if( whichClip < .2){
                  this.setState({emWhichExpression:"one", playEmExpression:true});
                }else if( whichClip < .4){
                  this.setState({emWhichExpression:"two", playEmExpression:true});
                }else if( whichClip < .6){
                  this.setState({emWhichExpression:"three", playEmExpression:true});
                }else if( whichClip < .8){
                  this.setState({emWhichExpression:"four", playEmExpression:true});
                }else{
                  this.setState({emWhichExpression:"five", playEmExpression:true});
                }
              }else{
                if( whichClip < .2){
                  this.setState({emWhichExpression:"ten", playEmExpression:true});
                }else if( whichClip < .4){
                  this.setState({emWhichExpression:"six", playEmExpression:true});
                }else if( whichClip < .6){
                  this.setState({emWhichExpression:"seven", playEmExpression:true});
                }else if( whichClip < .8){
                  this.setState({emWhichExpression:"eight", playEmExpression:true});
                }else{
                  this.setState({emWhichExpression:"nine", playEmExpression:true});
                }
              }
            }
            this.em_speak(text);

            //console.log(JSON.stringify(data, undefined, 2));
  				}.bind(this),
  				error: function() {
  					console.log("Internal Server Error");
  				}
  			});
  		}

      setMicFocus(location){
        console.log('setting mic location to: '+location);
        this.setState({mic_location:location});
      }

  em_speak(text, delay){
    if(!delay){
      delay = 0;
    }
    setTimeout(function(){
      var extraTime = 0;
      if(text.length > 70){
        extraTime=2000;
      }
      if($('.bubble').length > 3){
        $('.bubble:first-child').css('opacity','0');
          setTimeout(function(){
            if($('.bubble').length > 3){
              $('.bubble:first-child').remove();
            }
          },400);
      }
      var convoHistory=this.state.convoHistory;
      convoHistory.push({id:convoHistory.length,text:text,type:'bot',created_date:Date.now()});
      this.setState({convoHistory:convoHistory}, function(){
        console.log($("#convoHistory")[0].clientHeight - $("#convoHistory")[0].scrollHeight);
        $("#convoHistory").animate({ scrollTop: $("#convoHistory")[0].scrollHeight - $("#convoHistory")[0].clientHeight });
      });
      //add the new bubble
      $('#emResponses').append("<div class='bubble' style='opacity:0;'>"+text+"</div>");
      setTimeout(function(){
        $('.bubble').css('opacity',1);
      },100);
      //em bubble speech
      clearTimeout(window.convoBubble);
      window.convoBubble=setTimeout(function(){
        //hide speech
        $('.bubble').css('opacity',0);
        clearTimeout(window.clearBubbles);
        window.clearBubbles = setTimeout(function(){
          $('#emResponses').empty();
        },400);
      },4000+extraTime);
    }.bind(this),delay);
  }

  checkActions(action, parameters){
    if(action == 'create-new-thread'){
      if(parameters["thread-name"]){
        this.createNewFirebaseThread(parameters["thread-name"]);
      }else{
        this.createNewFirebaseThread();
      }
    }
  }


/***************** PAGE CONTROLS ******************/

  toggleConvoHistory(e){
    this.setState({
      convoHistoryOpen:!this.state.convoHistoryOpen
    },function(){
      if(this.state.convoHistoryOpen){
        $('#convoInput').focus();
        /*if($(window).width() < 650){
          //$("body").animate({ scrollTop: $("body").scrollHeight - $("body").clientHeight });
          //$("html").scrollTop(1000);

        }*/
        $("body").scrollTop(1000);
        if(this.state.onboarding_position==3){
          this.setState({onboarding_position:4},function(){
            this.nextIntroDialog();
          }.bind(this));
        }
      }else{
        if(this.state.onboarding_position==4){
          this.setState({onboarding_position:5},function(){
            this.nextIntroDialog();
          }.bind(this));
        }
      }
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
          ref="microphone"
          toggleMic={this.toggleMic.bind(this)}
          microphoneOn={this.state.microphoneOn}
          pass_final_transcript={this.pass_final_transcript.bind(this)}
        />
      );
    }
  }

  toggleMic(mic_setting){
    console.log(mic_setting);
    this.setState({microphoneOn:mic_setting});
    if(this.state.onboarding_position==1){
      this.setState({onboarding_position:2},function(){
        this.nextIntroDialog();
      }.bind(this));
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
          var convoHistory=this.state.convoHistory;
          convoHistory.push({id:convoHistory.length,text:text,type:'user'});
          input.innerHTML="";
          this.setState({
            convoHistory:convoHistory
          });
          this.send_Api_Ai(text);
        }else{
          var convoHistory=this.state.convoHistory;
          convoHistory.push({id:convoHistory.length,text:text,type:'user'});
          input.innerHTML="";
          this.setState({
            convoHistory:convoHistory
          });
          this.send_Api_Ai(text);
        }
      }
    }
  }

  convoInputOnFocus(e){
    this.setMicFocus("convo");
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
      var show_mic = (this.state.mic_location=="convo"?true:false);
      return(
        <div id="convoHistoryContainer" data-style={convoStyle} data-open={this.state.convoHistoryOpen}>
          {this.renderConvoHistoryInner()}
          <div data-show-mic={show_mic} placeholder="type here..." onFocus={this.convoInputOnFocus.bind(this)} onKeyDown={this.convoInputKeydown.bind(this)} onKeyUp={this.convoInputKeydown.bind(this)} id="convoInput" contentEditable="true"></div>
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
        <div id = "convoDisclaimer">Chatbot Coming Soon!</div>
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
    if(this.state.onboarding_position==8){
      this.setState({onboarding_position:9},function(){
        this.nextIntroDialog();
      }.bind(this));
    }
  }

  scrollThreads(){
    this.setState({
      thread_menu_open:false
    });
  }

  clickNewThreadButton(){
    /*
    if(this.state.onboarding_position!=6 && this.state.onboarding_position!=7 && this.state.onboarding_position!=8){
      this.em_speak("I'm happy to create a new thread for you as well!",500);
      this.em_speak("You can say: Create a new thread named ______.",1500);
    }*/
    this.createNewFirebaseThread();
  }

  renderThreadsNav(){
    if(this.state.threads_nav_visible && this.state.fire_logged_in){
      return (
        <div id="threads_nav">
          {this.renderThreadMenu()}
          {this.renderThreads()}
          <div id="threadsCover"></div>
          <div onClick={this.clickNewThreadButton.bind(this)} id="addThread">+</div>
        </div>
      );
    }
  }

  clickThreadMenu(e){
    e.stopPropagation();
  }

  renderThreadMenu(){
    var menuVisible=(this.state.thread_menu_open?true:false);
    var deleteVisible=(this.state.active_thread==this.state.user_everything_thread_id?false:true);
    var renameVisible=(this.state.active_thread==this.state.user_everything_thread_id?false:true);
      return(
        <div id="threadMenuWrap" data-visible={menuVisible}>
          <div onClick={this.clickThreadMenu.bind(this)} style={{left:this.state.thread_menu_left}} id="threadMenu">
            <div data-visible={deleteVisible} onClick={this.clickDeleteThreadMenu.bind(this)} id="deleteThread">Delete</div>
            <div data-visible={renameVisible} onClick={this.clickRenameThreadMenu.bind(this)} id="renameThread">Rename</div>
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
    if(this.state.active_thread=="user"){
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
        active_thread:"user",
        thread_menu_open:false,
        recoloring_thread_id:false,
        entries_loaded:false
      },function(){
        this.getFirebaseEntryData();
        //this.setEmBounds("center");
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
        this.setEmBounds("left");
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

    if(this.state.onboarding_position==7){
      if(name == '' || name == 'New Thread'){
        if(name == ''){
          this.em_speak("Oops! It looks like you left the thread name blank. Let's try that again. Type their name into the thread.");
        }else{
          this.em_speak("Oops! It looks like you named the thread 'New Thread'. Let's try that again. Type their name into the thread.");
        }
        $('.threadTitle[data-thread-id="'+thread_id+'"]').focus();
        document.execCommand('selectAll', false, null);
        return false;
      }
      this.setState({onboarding_position:8},function(){
        this.nextIntroDialog(name);
      }.bind(this));
    }

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
    if(this.state.onboarding_position==9){
      this.setState({onboarding_position:10},function(){
        this.nextIntroDialog();
      }.bind(this));
    }
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
    if(this.state.onboarding_position==10){
      this.setState({onboarding_position:11},function(){
        this.nextIntroDialog();
      }.bind(this));
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

  toggleMainMenu(){
    this.setState({mainMenuVisible:!this.state.mainMenuVisible});
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
            //console.log('couldnt find entry');
            entries_are_loaded=false;
          }
        }.bind(this));

      }
      /*console.log('**************');
      console.log(this.state.entries_loaded);
      console.log(thread_has_entries);
      console.log(Object.keys(this.state.entries).length);*/

      return(<Thread
        user_everything_thread_id={this.state.user_everything_thread_id}
        mainMenuVisible={this.state.mainMenuVisible}
        toggleMainMenu={this.toggleMainMenu.bind(this)}
        mic_location={this.state.mic_location}
        setMicFocus={this.setMicFocus.bind(this)}
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
    if(thread_id=='user'){
      thread_id=this.state.user_everything_thread_id;
    }
    this.createNewFirebaseEntry(type,thread_id);
    if(this.state.onboarding_position==11){
      this.setState({onboarding_position:12},function(){
        this.nextIntroDialog();
      }.bind(this));
    }
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
      });
    }else if(this.state.mainMenuVisible){
      this.setState({
        mainMenuVisible:false
      });
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
    if(this.state.active_thread=="user"){
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
      <div className="App" data-recording={this.state.microphoneOn} data-top-nav-hidden={this.state.topNavHidden} data-tray-color={trayColor} data-ui-color={uiColor} data-text-color={textColor} onClick={this.appClick.bind(this)} style={{background:photoBG}} data-active-entry={active_entry} data-convo-history-open={this.state.convoHistoryOpen} data-threads-open={this.state.threads_nav_visible}>
        {this.renderLogo()}
        <div className="AppInner" style={{background:activeThreadColor}}>
          {this.renderEmContainer()}
          {this.renderEmAnimation()}
          {this.renderEmSpeechBubble()}
          {this.renderColorPicker()}
          {this.renderMicrophone()}
          {this.renderConvoHistory()}
          {this.renderLogin()}
          {this.renderOnboarding()}
          {this.firebaseUserUpdateObject()}
          {this.renderThreadsNav()}
          {this.renderThreadPage(new_color)}
          {this.renderTooltip()}
        </div>
      </div>
    );
  }
}

export default App;
