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

class MainHeader extends Component {
	
	constructor(props) {
		super(props);
	}

	state = {
		signedIn: false, // Local signed-in state.
		displayName: ''
	};
	
	 componentDidMount() {
		var user = JSON.parse(localStorage.getItem('user'));
		
		if (user && user.token){
			this.setState({signedIn: true});
			this.setState({displayName: user.displayName});
		}
	 }
  
  handleSignOut = () => {
	  console.log("Handle Sign Out");
  }
	
  render() {
	return (
		<div>
		<header className="App-header">
		  <div><img src={logo} className="App-logo" alt="logo" /></div>
		  <div>Welcome {this.state.displayName} </div>
		  <button name="btnSignOut" id="btnSignOut" onClick={this.handleSignOut}>Sign Out</button>
		</header>
		</div>
    );
  }
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	
	return {signedIn, user}
}

export default connect(mapStateToProps)(MainHeader);
