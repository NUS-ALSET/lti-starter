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
} from 'react-router';

import ReactModal from 'react-modal';

import actions from './actions';

import {userService, messageService, groupService, questionService, answerService} from './services';

class JoinGroup extends Component {
	
	// The Id of group/class
	id = null;
	
	constructor(props) {
		super(props);
		var _this = this;
		
		const {match} = this.props;
		if (match){
			if (typeof (match.params.id) != "undefined"){
				this.id = match.params.id;
				
				groupService.getById(this.id).then(function(res){
					_this.setState({group: res});
					if (typeof(res.is_access) != "undefined"){
						if (res.is_access === true){
							_this.setState({isAccess: true});
						}
					}
					_this.setState({loading: false});
				}).catch(function(err){
					console.log("Cannot access the group");
					console.log(err);
				});
			}
		}
	}
	
	state = {
		loading: true,
		isAccess: false,
		group: {}
	};
	
	 componentDidMount() {
	 }
	
  handlePasswordChange = (e) =>{
	  this.setState({newPasswordEntry: e.target.value});
  }
  
  doAccessGroup = () =>{
	  if (this.state.newPasswordEntry){
		var _this = this;  
		groupService.register(this.id, this.state.newPasswordEntry).then(function(res){
			/*if (typeof(res.message) != "undefined"){
				// Add the new message to the state of current messages List
				_this.state.messages.push(res);
				_this.setState({messages: _this.state.messages});
			}*/
		}).catch(function(err){
			// Handle error
			console.log(err);
		});
	  }
  }

  render() {
	if (this.state.loading){
		return (
			<div>Loading...</div>
		);
	}
	if (!this.state.isAccess){
		return (
			<div>
				<div class="row">
					<div class="col-md-12">
						<center><h1>Request to join the group {this.id}</h1></center>
						<div>
							<span>Enter Group Password:</span>
							<input type="password" name="txtGroupPassword" onChange={this.handlePasswordChange}/><button type="button" name="btnSend" onClick={this.doAccessGroup}>Submit</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div>
			<h1>Redirect to Group {this.id}</h1>
		</div>
    );
  }
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	const isInstructor = state.isInstructor;
	
	return {signedIn, user, isInstructor}
}

export default connect(mapStateToProps)(JoinGroup);
