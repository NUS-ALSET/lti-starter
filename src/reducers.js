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

const userReducer = combineReducers({
  signedIn,
  user
})

export default userReducer;