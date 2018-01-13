import { combineReducers } from 'redux'
import {actionTypes} from './constants';

//let userData = JSON.parse(localStorage.getItem('user'));
//const initialState = userData ? {signedIn: true} : {};

function signedIn(state = {}, action) {
  switch (action.type) {
    case actionTypes.SIGNED_IN:
      return {
        signedIn: action.signedIn,
      };
	  
    case actionTypes.SIGNIN_FAILURE:
      return {};
	  
    case actionTypes.SIGNOUT:
      return {
        signedIn: false,
      };
	  
    default:
      return state
  }
}

function user(state = {}, action) {
  switch (action.type) {
    case actionTypes.SIGNED_USER:
      return {
        user: action.user,
      };
	  
    default:
      return state
  }
}

function displayName(state = {}, action) {
  switch (action.type) {
    case actionTypes.DISPLAY_NAME:
      return {
        displayName: action.displayName,
      };
    default:
      return state
  }
}

function isInstructor(state = {}, action) {
  switch (action.type) {
    case actionTypes.IS_INSTRUCTOR:
      return {
        isInstructor: action.isInstructor,
      };
    default:
      return state
  }
}

const userReducer = combineReducers({
  signedIn,
  user,
  displayName,
  isInstructor
})

export default userReducer;