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
		displayName: '',
		userType: ''
	};
	
	componentWillMount() {
		if (typeof(this.props.isInstructor) != "undefined"){
			if (this.props.isInstructor.isInstructor == true){
				this.setState({isInstructor: true});
				this.setState({userType: ' (Instructor)'});
			}
		}
	}
	
	componentDidMount() {
	 
		console.log("MainHeader componentWillReceiveProps");
		console.log(this.props);
		
		if (typeof(this.props.displayName) != "undefined"){
			this.setState({displayName: this.props.displayName.displayName});
		}
	}
	
	componentWillReceiveProps(){
		console.log("componentWillReceiveProps");
		console.log(this.props);
		if (typeof(this.props.displayName) != "undefined"){
			
			this.setState({displayName: this.props.displayName.displayName});
		}
	}
	
	createGroupLink = (props) =>{
		if (typeof(this.state.isInstructor) != "undefined"){
			if (this.state.isInstructor == true){
				return (
					<Link to={`/group/create`}>Create Group</Link>
				);
			}
		}
	}
	
	render() {
		return (
			<div>
			<header className="App-header">
			  <div><img src={logo} className="App-logo" alt="logo" /></div>
			  <div>Welcome {this.state.displayName} {this.state.userType}</div>
			  <div class="user-info">
				  <Link to={`/groups`}>Home</Link>
				  &nbsp; | &nbsp;
				  <this.createGroupLink />
				  &nbsp; | &nbsp;
				  <Link to={`/signout`}>Sign Out</Link>
			  </div>
			</header>
			</div>
		);
	}
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	const displayName = state.displayName;
	const isInstructor = state.isInstructor;
	
	return {signedIn, user, displayName, isInstructor}
}

export default connect(mapStateToProps)(MainHeader);

