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

import {userService, messageService, groupService} from './services';

class Group extends Component {
	
	constructor(props) {
		super(props);
		
		this.handleOpenModal = this.handleOpenModal.bind(this);
		this.handleCloseModal = this.handleCloseModal.bind(this);
	}

	handleOpenModal (group) {
		
		this.setState({selected_group: group, showModal: true });
	}

	handleCloseModal () {
		this.setState({ showModal: false });
	}
	
	state = {
		groups: [],
		showModal: false,
		
		selected_group: {id: null, name: null}
	};
	
	 componentDidMount() {
		 var _this = this;
		 console.log("STATE");
		 console.log(this.state);
		 console.log(this.props);
		 console.log("END STATE");
		 // Load Group List
		 groupService.getAll().then(function(res){
			 console.log({groups: res});
			 _this.setState({groups: res});
		 });
	 }
  
  handleGroupChange = (e) =>{
	  this.setState({newGroupEntry: e.target.value});
  }
  
  create = () =>{
	  // Write a new group
	  if (this.state.newGroupEntry){
		var _this = this;  
		groupService.create(this.state.newGroupEntry).then(function(res){
			if (typeof(res.name) != "undefined"){
				// Add the new group to the state of current group List
				_this.state.groups.push(res);
				_this.setState({groups: _this.state.groups});
			}
		});
	  }
  }
  
  handleGroupPasswordClick = (group, e) =>{
	  e.preventDefault();
	  this.handleOpenModal(group);
  }
  
  Group = (props) =>{
	  
	  const content = props.entries.map((data) =>{
	  
		let boundGroupPasswordClick = this.handleGroupPasswordClick.bind(this, data);
		
		return (
			<div class="row" key={data.id}>
			  <div class="col-md-4">{data.id}</div>
			  <div class="col-md-4">{data.group_name}</div>
			  <div class="cold-md-4">
				<Link to={`/group/${data.id}`}>View</Link>
				<a onClick={boundGroupPasswordClick}> Password </a>
			  </div>
			</div>
		)
	  });
	  return (
		<div>
		  {content}
		</div>
	  );
	}

	handleGroupPasswordChange = (e) =>{
	  this.setState({newGroupPasswordEntry: e.target.value});
  }
  
	createGroupPassword = () =>{
	  if (this.state.newGroupPasswordEntry){
		var _this = this;  
		groupService.createPassword(this.state.selected_group.id, this.state.newGroupPasswordEntry).then(function(res){
			_this.handleCloseModal();
		}).catch(function(err){
			console.log(err);
		});
	  }
  }
  
  render() {
	return (
      <div>
		<this.Group entries={this.state.groups} />
		
		<ReactModal 
			   isOpen={this.state.showModal}
			   contentLabel="Group Protection"
			   onRequestClose={this.handleCloseModal}
			   shouldCloseOnOverlayClick={false}
			>
			<button onClick={this.handleCloseModal}>Close</button>
			
			<div class="row">
				<div class="col-md-12">
					<h1>{this.state.selected_group.name}</h1>
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-12">
					<input type="password" onChange={this.handleGroupPasswordChange}/>
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-12">
					<button type="button" name="btnSetPass" onClick={this.createGroupPassword}>Submit</button>
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

export default connect(mapStateToProps)(Group);
