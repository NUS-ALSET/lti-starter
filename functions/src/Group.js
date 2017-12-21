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

import {userService, messageService, groupService} from './services';

class Group extends Component {
	
	constructor(props) {
		super(props);
	}

	state = {
		groups: []
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
  
  Group = (props) =>{
	  const content = props.entries.map((data) =>
		<div class="row" key={data.id}>
		  <div class="col-md-4">{data.id}</div>
		  <div class="col-md-4">{data.group_name}</div>
		  <div class="cold-md-4">
			<Link to={`/group/${data.id}`}>View</Link>
		  </div>
		</div>
	  );
	  return (
		<div>
		  {content}
		</div>
	  );
	}
	
  render() {
	return (
      <div>
		<this.Group entries={this.state.groups} />
	  </div>
    );
  }
}

function mapStateToProps(state) {
	const signedIn = state.signedIn;
	const user = state.user;
	
	return {signedIn, user}
}

export default connect(mapStateToProps)(Group);
