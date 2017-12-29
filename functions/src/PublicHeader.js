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

class PublicHeader extends Component {
	
	constructor(props) {
		super(props);
	}
	
	componentDidMount() {
	}
	
	componentWillReceiveProps(){

	}
	
	render() {
		return (
			<div>
			<header className="App-header">
			  <div><img src={logo} className="App-logo" alt="logo" /></div>
			</header>
			</div>
		);
	}
}

export default PublicHeader;

