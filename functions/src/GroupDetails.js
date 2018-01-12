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

import ReactModal from 'react-modal';

import actions from './actions';

import {userService, messageService, groupService, questionService, answerService} from './services';

class GroupDetails extends Component {
	
	// The Id of group/class
	id = null;
	joinGroupURL = null;
	
	constructor(props) {
		super(props);
		var _this = this;
		
		const {match, history} = this.props;
		console.log(match);
		console.log(this.props);
		if (match){
			if (typeof (match.params.id) != "undefined"){
				this.id = match.params.id;
				this.joinGroupURL = '/group/join/' + this.id;
				
				groupService.getById(this.id).then(function(res){
					if (typeof(res.err) == "undefined" && typeof(res.id) != "undefined"){
						_this.setState({group: res});
						_this.setState({groupName: res.group_name});
					}
					if (typeof(res.is_access) != "undefined"){
						if (res.is_access === true){
							_this.setState({isAccess: true});
							if(res.is_owner === true){
								_this.setState({isOnwer: true});
							}
							_this.loadMessages();
							_this.loadQuestions();
						}else{
							history.replace({ pathname: _this.joinGroupURL });
						}
					}
					
					if (typeof(res.id) == "undefined"){
						_this.setState({isNotFound: true});
					}
					
					_this.setState({loading: false});
				}).catch(function(err){
					console.log("Cannot access the group");
					console.log(err);
				});
			}
		}
		
		this.handleOpenModal = this.handleOpenModal.bind(this);
		this.handleCloseModal = this.handleCloseModal.bind(this);
		//this.passwordProtectedGroupLink = this.passwordProtectedGroupLink.bind(this)
	}
	
	handleOpenModal (question) {
		
		this.setState({selected_question: question, showModal: true });
	}

	handleCloseModal () {
		this.setState({ showModal: false });
	}

	state = {
		loading: true,
		isAccess: false,
		isNotFound: false,
		group: {},
		messages: [],
		questions: [],
		showModal: false,
		
		selected_question: {id: null, name: null},
		
		groupName: '',
		cssHide: 'css-hide'
	};
	
	 componentDidMount() {
		 var _this = this;
		 
		 /*
		 // Load Messages List
		 messageService.getByGroupId(this.id).then(function(res){
			 _this.setState({messages: res});
		 });
		 
		 // Load Question List
		 this.loadQuestions();
		 */
		 
		 if (this.props.isInstructor.isInstructor == true){
			 this.setState({cssHide: ''});
		 }
	 }
	
	loadMessages = () =>{
		var _this = this;
		
		messageService.getByGroupId(this.id).then(function(res){
			 _this.setState({messages: res});
		});
	}
	
	loadQuestions = () =>{
		var _this = this;
		questionService.getByGroupId(this.id).then(function(res){
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
		<div className="row" key={post.id}>
		  <div className="col-md-4">{post.id}</div>
		  <div className="col-md-4">{post.uid}</div>
		  <div className="col-md-4">{post.message}</div>
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
  
  createQuestion = (props) =>{
	  if (this.state.newQuestionEntry){
		var _this = this;  
		questionService.create(this.id, this.state.newQuestionEntry).then(function(res){
			if (typeof(res.name) != "undefined"){
				// Add the new question to the state of current Question List
				_this.loadQuestions();
			}
		});
	  }
  }
  
  handleAnswerClick = (question, e) =>{
	  this.handleOpenModal(question);
  }
  
  Question = (props) =>{
	  
	  
	  const content = props.entries.map((post) =>{
		  
		  let boundAnswerClick = this.handleAnswerClick.bind(this, post);
		  console.log("QUESTIONS");
		  console.log(this.props.isInstructor.isInstructor);
		  
		  if (this.props.isInstructor.isInstructor == false){
			  return(
				<div key={post.id}>
					<div className="row">
					  <div className="col-md-12">{post.name}</div>
					</div>
					<div className="row">
						<div className="col-md-12"><button  type="button" name="btnAnswerModal" onClick={boundAnswerClick}>Submit an answer</button></div>
					</div>
					<this.Answer entries={post.answer_data} />
				</div>
				)
		  }
		  
		  return(
			<div key={post.id}>
				<div className="row">
				  <div className="col-md-12">{post.name}</div>
				</div>
				<this.Answer entries={post.answer_data} />
			</div>
			)
		}
	  );
	  return (
		<div>
		  {content}
		</div>
	  );
	}

  Answer = (props) =>{
	  const content = props.entries.map((post) =>
		<div className="row answer-row" key={post.id}>
			<div className="col-md-4">{post.uid}</div>
			<div className="col-md-8">{post.content}</div>
		</div>
	  );
	  return (
		<div>
		{content}
		</div>
	  );
  }
  
  handleAnswerChange = (e) =>{
	  this.setState({newAnswerEntry: e.target.value});
	}
  
  createAnswer = () =>{
	  if (this.state.newAnswerEntry){
		var _this = this;  
		answerService.create(this.state.selected_question.id, this.state.newAnswerEntry).then(function(res){
			if (typeof(res.content) != "undefined"){
				// Add the new answer to the state of current answer List
				//_this.state.questions.push(res);
				//_this.setState({questions: _this.state.questions});
				
				_this.loadQuestions();
				_this.handleCloseModal();
			}
		});
	  }
  }
  
  passwordProtectedGroupLink = (props) =>{
	  console.log(this.props.isInstructor);
		if (typeof(this.props.isInstructor) != "undefined"){
			if (this.props.isInstructor.isInstructor == true){
				return (
					<Link to={`/group/pass-protected/${this.id}`}>Password-Protected Group</Link>
				);
			}
		}
		
		return(
			<div></div>
		);
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
	
	if (!this.state.isAccess){
		return (
			<div>
				<h1>You don't have permission to access this group</h1>
			</div>
		);
	}
	return (
		<div>
			<div className="row group-info-block">
				<div className="row">
					<div className="col-md-2">Group ID:</div>
					<div className="col-md-2">{this.id}</div>
				</div>
				<div className="row">
					<div className="col-md-2">Group Name:</div>
					<div className="col-md-2">{this.state.groupName}</div>
				</div>
				<div className="row">
					<div className="col-md-2"></div>
					<div className="col-md-2"><this.passwordProtectedGroupLink /></div>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 message-block">
					<center><h1>Messages</h1></center>
					<div>
						<span>Leave a message:</span>
						<input type="text" name="txtMessage" id="txtMessage" onChange={this.handleMessageChange}/><button type="button" name="btnSend" id="btnSend" onClick={this.writeNewMessage}>Submit</button>
					</div>
					<this.Message entries={this.state.messages} />
				</div>
				<div className="col-md-6 question-block">
					<center><h1>Questions</h1></center>
					<div className={this.state.cssHide}>
						<span>Create a question:</span>
						<input type="text" name="txtQuestion" id="txtQuestion" onChange={this.handleQuestionChange}/><button type="button" name="btnQSend" id="btnQSend" onClick={this.createQuestion}>Submit</button>
					</div>
					<this.Question entries={this.state.questions} />
				</div>
			</div>
			
			<ReactModal 
			   isOpen={this.state.showModal}
			   contentLabel="Answer A Question"
			   onRequestClose={this.handleCloseModal}
			   shouldCloseOnOverlayClick={false}
			>
				<button onClick={this.handleCloseModal}>Close</button>
				
				<div className="row">
					<div className="col-md-12">
						<h1>{this.state.selected_question.name}</h1>
					</div>
				</div>
				
				<div className="row">
					<div className="col-md-12">
						<textarea width="400px" height="200px" onChange={this.handleAnswerChange}/>
					</div>
				</div>
				
				<div className="row">
					<div className="col-md-12">
						<button type="button" name="btnASend" id="btnASend" onClick={this.createAnswer}>Submit</button>
					</div>
				</div>
				
			</ReactModal>
		
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

export default connect(mapStateToProps)(GroupDetails);
