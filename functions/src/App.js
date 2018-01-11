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

import {MainLayout} from './MainLayout';
import {PublicLayout} from './PublicLayout';

import Group from './Group';
import GroupDetails from './GroupDetails';
import JoinGroup from './JoinGroup';

import actions from './actions';

import {userService, messageService} from './services';

import configData from './config';

import RequireAuth from './RequireAuth';

// Configure Firebase.
const config = {
  apiKey: configData.lti.apiKey,
  authDomain: configData.lti.authDomain,
  databaseURL: configData.lti.databaseURL,
  storageBucket: configData.lti.storageBucket
};

firebase.initializeApp(config);

class App extends Component {

	constructor(props) {
		super(props);
		var _this = this;
		const {dispatch} = this.props;
		
		firebase.auth().onAuthStateChanged(function(currentUser) {
		  if (currentUser) {
		  
			// User is signed in.
			var uid = currentUser.uid;
			console.log("Already signed in");
			console.log("uid:" + uid);
			
			var displayName = currentUser.displayName ? currentUser.displayName: uid;
			var providerData = currentUser.providerData;
			
			currentUser.getIdToken().then(function(token){	
				dispatch(actions.setSignedIn(true));
				dispatch(actions.setDisplayName(displayName));
				dispatch(actions.setUser({displayName: displayName, uid: uid, token: token}));
				localStorage.removeItem('user');
				localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
				
				// Verify Token, Auto create group and member if any
				userService.verifyToken(token).then(function(data){
					dispatch(actions.setIsInstructor(data.is_instructor));
					_this.setState({signedIn:true});
					_this.setState({displayName:displayName});
					_this.setState({uid:uid});
					_this.setState({loading:false});
					
				}).catch(function(err) {
					// Error
					console.log("Sign out as the id of token cannot be verified");
					dispatch(actions.setSignedIn(false));
					dispatch(actions.setDisplayName(''));
					dispatch(actions.setUser({}));
					localStorage.removeItem('user');
					
					_this.setState({signedIn:false});
					_this.setState({displayName:null});
					_this.setState({uid:null});
					_this.setState({loading:false});
				});
			});
			
		  } else {
		  
			// User is signed out.
			dispatch(actions.setSignedIn(false));
			dispatch(actions.setDisplayName(''));
			dispatch(actions.setUser({}));
			localStorage.removeItem('user');
			
			_this.setState({signedIn:false});
			_this.setState({displayName:null});
			_this.setState({uid:null});
			_this.setState({loading:false});
		  }
		});
	}

	state = {
		loading: true,
		signedIn: false,
		messages: []
	};
	
	componentDidMount() {
		// Do something if needed
	}

	componentWillReceiveProps(){
		// Do something if needed
	}
	
  hasSignedIn = () =>{
	  if (typeof(this.state.signedIn) != "undefined"){
		  return this.state.signedIn;
	  }
	  
	  return false;
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
	
	if (this.state.loading){
		return (
			<div className="App">Loading...</div>
		);
	}
	
	return (
      <div className="App">
		<Router>
			<Switch>
				<MainLayout exact path="/" component={RequireAuth(Group)} />
				<MainLayout exact path="/groups" component={RequireAuth(Group)}/>
				<MainLayout path="/group/join/:id" component={RequireAuth(JoinGroup)} />
				<MainLayout path="/group/:id" component={RequireAuth(GroupDetails)} />
				
				<PublicLayout path="/signin" component={SignInC} />
				<PublicLayout path="/ctoken/:id" component={SignInC} />
				<PublicLayout path="/signout" component={SignOutC} />
			</Switch>
		</Router>
	  </div>
    );
  }
}

function mapStateToProps(state) {
	
	console.log("mapStateToProps");
	const signedIn = state.signedIn;
	const user = state.user;
	const displayName = state.displayName;
	const isInstructor = state.isInstructor;
	
	return {signedIn, user, displayName, isInstructor}
}

export default connect(mapStateToProps)(App);


class SignIn extends Component {
	
	ctoken = null;
	constructor(props) {
		super(props);
		var _this = this;
		console.log("Signin");
		const {match, dispatch} = this.props;
		console.log(this.props);
		console.log("----------------------------END----------------------------");
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
							dispatch(actions.setSignedIn(true));
							dispatch(actions.setDisplayName(displayName));
							dispatch(actions.setUser({displayName: displayName, uid: uid, token: token}));
							localStorage.removeItem('user');
							localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
							
							_this.setState({signedIn:true});
							
							// Verify Token, Auto create group and member if any
							userService.verifyToken(token);
						});
						
					  } else {
					  
						// User is signed out.
						dispatch(actions.setSignedIn(false));
						dispatch(actions.setUser({}));
						localStorage.removeItem('user');
						
						_this.setState({signedIn:false});
						console.log("signed out");
					  }
					});
				}
			}
		}
	}

	state = {
		signedIn: false, // Local signed-in state.
	};
	
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
			const {dispatch} = this.props;
			var _this = this;
			
			currentUser.getIdToken().then(function(token){
				dispatch(actions.setSignedIn(true));
				dispatch(actions.setDisplayName(displayName));
				dispatch(actions.setUser({displayName: displayName, uid: uid, token: token}));
				localStorage.removeItem('user');
				localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
				
				_this.setState({signedIn:true});
				
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
		<Redirect to={{ pathname: '/groups' }} />
	);
  }
}
const SignInC = connect(mapStateToProps)(SignIn);

class SignOut extends Component {
	constructor(props) {
		super(props);
		const {dispatch} = this.props;
		
		firebase.auth().signOut().then(function(){
			// Initialize the FirebaseUI Widget using Firebase.
			//var ui = new firebaseui.auth.AuthUI(firebase.auth());
			// The start method will wait until the DOM is loaded.
			//ui.start('#firebaseui-auth-container', uiConfig);
			
			// User is signed out.
			dispatch(actions.setSignedIn(false));
			dispatch(actions.setDisplayName(''));
			dispatch(actions.setUser({}));
			localStorage.removeItem('user');
				
		}).catch(function(error){
			// An error happended.
		});
	}
	
	state = {
		loading: true
	};
	
	render() {
		return (
			<Redirect to={{ pathname: '/signin' }} />
		)
	}
}

const SignOutC = connect(mapStateToProps)(SignOut);


class SignInWCToken extends Component {
	
	ctoken = null;
	constructor(props) {
		super(props);
		var _this = this;
		const {match} = this.props;
		
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
						console.log("uid:" + uid);
						
						var displayName = currentUser.displayName ? currentUser.displayName: uid;
						var providerData = currentUser.providerData;
						
						currentUser.getIdToken().then(function(token){	
							
							localStorage.setItem('user', JSON.stringify({displayName: displayName, uid: uid, token: token}));
							
							_this.setState({loading:false});
							
							// Verify Token, Auto create group and member if any
							userService.verifyToken(token);
						});
						
					  } else {
					  
						// User is signed out.
						localStorage.removeItem('user');
						
						_this.setState({loading:false});
						
						console.log("signed out");
					  }
					});
				}else{
					_this.setState({loading:false});
				}
			}
		}
	}
	
	state = {
		loading: true,
	};
	
  render() {
	if (this.state.loading){
		return (
			<div>In Process...</div>
		);
	}
	return (
		<Redirect to={{ pathname: '/groups' }} />
	);
  }
}