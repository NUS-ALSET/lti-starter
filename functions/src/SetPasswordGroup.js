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

class SetPasswordGroup extends Component {
	
	// The Id of group/class
	id = null;
	toURL = null;
	
	constructor(props) {
		super(props);
		var _this = this;
		
		const {match, history} = this.props;
		if (match){
			if (typeof (match.params.id) != "undefined"){
				this.id = match.params.id;
				this.toURL = '/group/' + this.id;
				
				groupService.getById(this.id).then(function(res){
					if(typeof(res.err) != "undefined"){
						_this.setState({isNotFound: true});
						
					}else if (typeof(res.is_access) != "undefined"){
						_this.setState({groupName: res.group_name});
						
						if (res.is_access === true){
							_this.setState({group: res});
							_this.setState({isAccess: true});
						}
					}
					_this.setState({loading: false});
				}).catch(function(err){
					console.log(err);
				});
			}
		}
	}
	
	state = {
		loading: true,
		isAccess: false,
		group: {},
		groupName: '',
		isNotFound: false
	};
	
	 componentDidMount() {
	 }
	
  handlePasswordChange = (e) =>{
	  this.setState({newPasswordEntry: e.target.value});
  }
  
  createGroupPassword = () =>{
	  var _this = this;
	  const {history} = this.props;
	  
	  if (this.state.newPasswordEntry){
		
		groupService.createPassword(this.id, this.state.newPasswordEntry).then(function(res){
			if (typeof(res.status) != "undefined"){
				if (res.status == 'ok'){
					history.replace({ pathname: _this.toURL });
				}
			}
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
	
	if (this.state.isNotFound){
		
		return (
			<div>
				<h1>NOT FOUND</h1>
			</div>
		);
	}
	
	if (!this.state.isAccess || !this.props.isInstructor.isInstructor){
		
		return (
			<div>
				<h1>You don't have permission to access the group {this.state.groupName}</h1>
			</div>
		);
	}
	

	return (
		<div>
			<div className="row">
				<div className="col-md-12">
					<center><h1>Group {this.state.groupName}</h1></center>
					
					<div>
						<span>Enter Password:</span>
						<input type="text" name="txtGroupPassword" onChange={this.handlePasswordChange}/><button type="button" name="btnSend" onClick={this.createGroupPassword}>Submit</button>
					</div>
				</div>
			</div>
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

export default connect(mapStateToProps)(SetPasswordGroup);
