import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {connect} from 'react-redux';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  Switch
} from 'react-router-dom';

import { FirebaseAuth } from 'react-firebaseui';
import firebase from 'firebase';

import {MainLayoutRoute} from './MainLayoutRoute';

import Group from './Group';
import GroupDetails from './GroupDetails';

import actions from './actions';

import {userService, messageService} from './services';

// Configure Firebase.
const config = {
  apiKey: "AIzaSyBL1XcR8F-m_gNcKLBNdIGvcv7DYjLvgrI",
  authDomain: "fir-lti-35fdc.firebaseapp.com",
  databaseURL: "https://fir-lti-35fdc.firebaseio.com",
  storageBucket: "fir-lti-35fdc.appspot.com"
};

firebase.initializeApp(config);

class App extends Component {
	
	ctoken = null;
	constructor(props) {
		super(props);
		var _this = this;
		
		firebase.auth().onAuthStateChanged(function(currentUser) {
		  if (currentUser) {
		  
			// User is signed in.
			var uid = currentUser.uid;
			console.log("Already signed in");
			console.log("uid:" + uid);
			
			var displayName = currentUser.displayName ? currentUser.displayName: uid;
			var providerData = currentUser.providerData;
			
			currentUser.getIdToken().then(function(token){	
				_this.props.dispatch(actions.setSignedIn(true));
				_this.props.dispatch(actions.setUser({displayName: displayName, uid: uid, token: token}));
				localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
				
				_this.setState({signedIn:true});
				_this.setState({displayName:displayName});
				_this.setState({uid:uid});
				
				// Verify Token, Auto create group and member if any
				//userService.verifyToken(token);
			});
			
		  } else {
		  
			// User is signed out.
			_this.props.dispatch(actions.setSignedIn(false));
			_this.props.dispatch(actions.setUser({}));
			localStorage.removeItem('user');
			
			_this.setState({signedIn:false});
			_this.setState({displayName:null});
			_this.setState({uid:null});
			console.log("signed out");
		  }
		});
	}

	state = {
		signedIn: false, // Local signed-in state.
		displayName: '',
		messages: []
	};
	
	 componentDidMount() {
		 var _this = this;
		 console.log("componentDidMount");
		 /*
		 // Load Messages List
		 messageService.getAll().then(function(res){
			 console.log("returned messages");
			 console.log(res);
			 _this.setState({messages: res});
		 });
		 */
	 }
  
  handleSignOut = () => {
	/*firebase.auth().signOut().then(function(){
		// Initialize the FirebaseUI Widget using Firebase.
		//var ui = new firebaseui.auth.AuthUI(firebase.auth());
		// The start method will wait until the DOM is loaded.
		//ui.start('#firebaseui-auth-container', uiConfig);
		
		// User is signed out.
		this.props.dispatch(actions.setSignedIn(false));
		this.props.dispatch(actions.setUser({}));
		localStorage.removeItem('user');
		
		this.setState({signedIn:false});
		this.setState({displayName:null});
		this.setState({uid:null});
		console.log("Signed Out");
			
	}).catch(function(error){
		// An error happended.
	});*/
  }
  
  handleMessageChange = (e) =>{
	  this.setState({newMessageEntry: e.target.value});
  }
  
  writeNewMessage = () =>{
	  // Write a new message to group
	  if (this.state.newMessageEntry){
		var _this = this;  
		messageService.create(this.state.newMessageEntry).then(function(res){
			if (typeof(res.message) != "undefined"){
				// Add the new message to the state of current messages List
				_this.state.messages.push(res);
				_this.setState({messages: _this.state.messages});
			}
		});
	  }
  }
  
  Message = (props) =>{
	  const content = props.entries.map((post) =>
		<div class="row" key={post.id}>
		  <div class="col-md-4">{post.id}</div>
		  <div class="col-md-4">{post.uid}</div>
		  <div class="col-md-4">{post.message}</div>
		</div>
	  );
	  return (
		<div>
		  {content}
		</div>
	  );
	}
	
  render() {
	return (
      <div className="App">
		<Router>
			<Switch>
				<MainLayoutRoute exact path="/" component={Group} />
				<MainLayoutRoute exact path="/groups" component={Group} />
				<MainLayoutRoute path="/group/:id" component={GroupDetails} />
				<Route path="/signin" component={SignIn} />
				<Route path="/ctoken/:id" component={SignIn} />
			</Switch>
		</Router>
	  </div>
    );
  }
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	
	return {signedIn, user}
}

export default connect(mapStateToProps)(App);


class SignIn extends Component {
	
	ctoken = null;
	constructor(props) {
		super(props);
		var _this = this;
		console.log("Signin");
		const {match} = this.props;
		console.log(match);
		
		if (match){
			if (typeof (match.params.id) != "undefined"){
				this.ctoken = match.params.id;
				
				if (this.ctoken){
					firebase.auth().signInWithCustomToken(this.ctoken).catch(function(error) {
					  // Handle Errors here.
					  var errorCode = error.code;
					  var errorMessage = error.message;
					});
					
					firebase.auth().onAuthStateChanged(function(currentUser) {
					  if (currentUser) {
					  
						// User is signed in.
						var uid = currentUser.uid;
						console.log("Already signed in");
						console.log("uid:" + uid);
						
						var displayName = currentUser.displayName ? currentUser.displayName: uid;
						var providerData = currentUser.providerData;
						
						currentUser.getIdToken().then(function(token){	
							_this.props.dispatch(actions.setSignedIn(true));
							_this.props.dispatch(actions.setUser({displayName: displayName, uid: uid, token: token}));
							localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
							
							_this.setState({signedIn:true});
							_this.setState({displayName:displayName});
							_this.setState({uid:uid});
							
							// Verify Token, Auto create group and member if any
							userService.verifyToken(token);
						});
						
					  } else {
					  
						// User is signed out.
						_this.props.dispatch(actions.setSignedIn(false));
						_this.props.dispatch(actions.setUser({}));
						localStorage.removeItem('user');
						
						_this.setState({signedIn:false});
						_this.setState({displayName:null});
						_this.setState({uid:null});
						console.log("signed out");
					  }
					});
				}
			}
		}
	}

	state = {
		signedIn: false, // Local signed-in state.
		displayName: ''
	};
	
	 componentDidMount() {
	 }
	 
	// Configure FirebaseUI.
	uiConfig = {
		// Popup signin flow rather than redirect flow.
		signInFlow: 'popup',
		// We will display Google and Facebook as auth providers.
		signInOptions: [
		  firebase.auth.GoogleAuthProvider.PROVIDER_ID
		],
		// Sets the `signedIn` state property to `true` once signed in.
		callbacks: {
		  signInSuccess: (currentUser, credential, redirectUrl) => {
			
			// User is already signed in.
			var uid = currentUser.uid;
			console.log("uid:" + uid);
			console.log(currentUser);
			
			var displayName = currentUser.displayName ? currentUser.displayName: uid;
			var providerData = currentUser.providerData;
			
			currentUser.getIdToken().then(function(token){
				this.props.dispatch(actions.setSignedIn(true));
				this.props.dispatch(actions.setUser({displayName: displayName, uid: uid, token: token}));
				localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
				
				this.setState({signedIn:true});
				this.setState({displayName:displayName});
				this.setState({uid:uid});
				
				// Verify Token, Auto create group and member if any
				userService.verifyToken(token);
			});
			
			return false; // Avoid redirects after sign-in.
		  }
		}
	};

  render() {
	if (!this.state.signedIn) {
		return (
			<FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
		);
	}
	
	return (
		<Redirect to={{ pathname: '/signin' }} />
	);
  }
}