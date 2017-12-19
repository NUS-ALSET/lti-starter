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

import actions from './actions';

import {userService, messageService, groupService, questionService} from './services';

class GroupDetails extends Component {
	
	// The Id of group/class
	id = null;
	
	constructor(props) {
		super(props);
		var _this = this;
		
		const {match} = this.props;
		console.log(match);
		console.log(this.props);
		if (match){
			if (typeof (match.params.id) != "undefined"){
				this.id = match.params.id;
				
				console.log("GroupID: " + this.id);
				
				groupService.getById(this.id).then(function(res){
					_this.setState({group: res});
					if (typeof(res.is_access) != "undefined"){
						if (res.is_access === true){
							_this.setState({isAccess: true});
						}
					}
					_this.setState({loading: false});
				});
			}
		}
	}

	state = {
		loading: true,
		isAccess: false,
		group: {},
		messages: [],
		questions: []
	};
	
	 componentDidMount() {
		 var _this = this;
		 
		 // Load Messages List
		 messageService.getByGroupId(this.id).then(function(res){
			 console.log("returned messages");
			 console.log(res);
			 _this.setState({messages: res});
		 });
		 
		 // Load Question List
		 questionService.getByGroupId(this.id).then(function(res){
			 console.log("returned questions");
			 console.log(res);
			 _this.setState({questions: res});
		 });
	 }
	
  handleMessageChange = (e) =>{
	  this.setState({newMessageEntry: e.target.value});
  }
  
  writeNewMessage = () =>{
	  // Write a new message to group
	  if (this.state.newMessageEntry){
		var _this = this;  
		messageService.create(this.id, this.state.newMessageEntry).then(function(res){
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
	
	handleQuestionChange = (e) =>{
	  this.setState({newQuestionEntry: e.target.value});
  }
  
  createQuestion = () =>{
	  if (this.state.newQuestionEntry){
		var _this = this;  
		questionService.create(this.id, this.state.newQuestionEntry).then(function(res){
			if (typeof(res.name) != "undefined"){
				// Add the new question to the state of current Question List
				_this.state.questions.push(res);
				_this.setState({questions: _this.state.questions});
			}
		});
	  }
  }
  
  Question = (props) =>{
	  const content = props.entries.map((post) =>
		<div class="row" key={post.id}>
		  <div class="col-md-4">{post.id}</div>
		  <div class="col-md-4">{post.uid}</div>
		  <div class="col-md-4">{post.name}</div>
		</div>
	  );
	  return (
		<div>
		  {content}
		</div>
	  );
	}
	
  Answer = (props) =>{
	  const content = props.entries.map((post) =>
		<div class="row answer-row" key={post.id}>
			<div class="col-md-2">{post.uid} answered: </div>
			<div class="col-md-10">post.content</div>
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
			<div>Loading...</div>
		);
	}
	if (!this.state.isAccess){
		return (
			<div>
				<h1>You don't have permission to access this group</h1>
			</div>
		);
	}
	return (
		<div>
			<div class="row group-info-block">
				<div class="row">
					<div class="col-md-2">Group ID:</div>
					<div class="col-md-2">{this.id}</div>
				</div>
				<div class="row">
					<div class="col-md-2">Group Name:</div>
					<div class="col-md-2">Hello</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6 message-block">
					<center><h1>Messages</h1></center>
					<div>
						<span>Leave a message:</span>
						<input type="text" name="txtMessage" id="txtMessage" onChange={this.handleMessageChange}/><button type="button" name="btnSend" id="btnSend" onClick={this.writeNewMessage}>Submit</button>
					</div>
					<this.Message entries={this.state.messages} />
				</div>
				<div class="col-md-6 question-block">
					<center><h1>Questions</h1></center>
					<div>
						<span>Create a question:</span>
						<input type="text" name="txtQuestion" id="txtQuestion" onChange={this.handleQuestionChange}/><button type="button" name="btnQSend" id="btnQSend" onClick={this.createQuestion}>Submit</button>
					</div>
					<this.Question entries={this.state.questions} />
				</div>
			</div>
		</div>
    );
  }
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	
	return {signedIn, user}
}

export default connect(mapStateToProps)(GroupDetails);
