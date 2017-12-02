import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { FirebaseAuth } from 'react-firebaseui';
import firebase from 'firebase';

// Configure Firebase.
const config = {
  apiKey: "AIzaSyBL1XcR8F-m_gNcKLBNdIGvcv7DYjLvgrI",
  authDomain: "fir-lti-35fdc.firebaseapp.com",
  databaseURL: "https://fir-lti-35fdc.firebaseio.com",
  storageBucket: "fir-lti-35fdc.appspot.com"
};

firebase.initializeApp(config);

class App extends Component {
	
  state = {
    signedIn: false, // Local signed-in state.
	displayName: ''
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
		var isAnonymous = currentUser.isAnonymous;
		var uid = currentUser.uid;
		console.log("uid:" + uid);
		console.log(currentUser);
		
		var displayName = currentUser.displayName;
		
		var providerData = currentUser.providerData;
		this.setState({displayName: displayName});
		
        this.setState({signedIn: true});
        return false; // Avoid redirects after sign-in.
      }
    }
  };
  
  render() {
	if (!this.state.signedIn) {
		return (
		  <div className="App">
			<header className="App-header">
			  <img src={logo} className="App-logo" alt="logo" />
			  <h1 className="App-title">Welcome to React LMS App</h1>
			</header>
			<p className="App-intro">
			  <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
			</p>
		  </div>
		);
	}
	
	return (
      <div className="App">
		<header className="App-header">
		  <img src={logo} className="App-logo" alt="logo" />
		  <h1 className="App-title">Welcome to React LMS App</h1>
		</header>
		<p>Welcome {this.state.displayName}</p>
		<p className="App-intro">
		  You are now signed-in!
		</p>
	  </div>
    );
  }
}

export default App;
