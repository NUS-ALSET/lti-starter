import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {connect} from 'react-redux';

import {
  BrowserRouter,
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
		displayName: ''
	};
	
	componentDidMount() {
	 
	 console.log("MainHeader componentWillReceiveProps");
	console.log(this.props);
	if (typeof(this.props.displayName) != "undefined"){
		
		this.setState({displayName: this.props.displayName.displayName});
	}
		
	/*var user = JSON.parse(localStorage.getItem('user'));

	if (user && user.token){
		this.setState({displayName: user.displayName});
	}*/
	}
	
	componentWillReceiveProps(){
		console.log("componentWillReceiveProps");
		console.log(this.props);
		if (typeof(this.props.displayName) != "undefined"){
			
			this.setState({displayName: this.props.displayName.displayName});
		}
	}
	
	render() {
		return (
			<div>
			<header className="App-header">
			  <div><img src={logo} className="App-logo" alt="logo" /></div>
			  <div>Welcome {this.state.displayName} </div>
			  <Link to={`/signout`}>Sign Out</Link>
			</header>
			</div>
		);
	}
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	const displayName = state.displayName;
	
	return {signedIn, user, displayName}
}

export default connect(mapStateToProps)(MainHeader);

