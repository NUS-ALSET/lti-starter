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

class CreateGroup extends Component {
	
	// The Id of group/class
	id = null;
	toURL = null;
	
	constructor(props) {
		super(props);
	}
	
	state = {
		loading: true,
		isAccess: false,
		isInstructor: false,
		group: {},
		msg: ''
	};
	
	componentWillMount() {
		if (typeof(this.props.isInstructor) != "undefined"){

			if (this.props.isInstructor.isInstructor == true){
				this.setState({isInstructor: true});
				this.setState({loading: false});
			}
		}
	}
	
	 componentDidMount() {
	 }

	 handleIdChange = (e) =>{
	  this.setState({newIdEntry: e.target.value});
  }
  
	 handleNameChange = (e) =>{
	  this.setState({newNameEntry: e.target.value});
  }
  
  handlePasswordChange = (e) =>{
	  this.setState({newPasswordEntry: e.target.value});
  }
  
  createGroup = () =>{
	  var _this = this;
	  const {history} = this.props;
	  
	  if (!this.state.newNameEntry){
		  this.setState({msg: 'Requires name'});
		  return;
	  }
	  
	  if (!this.state.newPasswordEntry){
		  this.setState({msg: 'Requires password'});
		  return;
	  }
	  
	  this.setState({msg: ''});
	  
		groupService.create(this.state.newIdEntry, this.state.newNameEntry, this.state.newPasswordEntry).then(function(res){
			
			if (typeof(res.err) != "undefined"){
				_this.setState({msg: res.err});
			}else if (typeof(res.is_access) != "undefined"){
				_this.setState({msg: 'The group has just been created'});
			}

		}).catch(function(err){
			// Handle error
			console.log(err);
		});

  }

  render() {
	if (this.state.loading){
		return (
			<div>Loading...</div>
		);
	}
	
	if (!this.state.isInstructor){
		return (
			<div>
				<h1>You don't have permission to create group/class</h1>
			</div>
		);
	}
	
	return (
		<div>
			<div className="row">
				<div className="col-md-12">
					<center><h1>Create a new group</h1></center>
					<div className="row">
						<div className="col-md-2"></div>
						<div className="col-md-10">{this.state.msg}</div>
					</div>
					<div className="row">
						<div className="col-md-2">Id:</div>
						<div className="col-md-10"><input type="text" name="txtId" onChange={this.handleIdChange}/></div>
					</div>
					<div className="row">
						<div className="col-md-2">Name:</div>
						<div className="col-md-10"><input type="text" name="txtName" onChange={this.handleNameChange}/></div>
					</div>
					<div className="row">
						<div className="col-md-2">Password:</div>
						<div className="col-md-10"><input type="text" name="txtGroupPassword" onChange={this.handlePasswordChange}/></div>
					</div>
					<div>
						<div className="col-md-2"></div>
						<div className="col-md-10"><button type="button" name="btnSend" onClick={this.createGroup}>Submit</button></div>
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

export default connect(mapStateToProps)(CreateGroup);
