/*
 * action types
 */
import {actionTypes} from './constants';

/*
 * other constants
 */



/*
 * action creators
 */
function setSignedIn(signedIn) {
  return {
    type: actionTypes.SIGNED_IN,
    signedIn
  };
};

function setUser(user) {
  return {
    type: actionTypes.SIGNED_USER,
    user
  };
};

function setDisplayName(displayName) {
  return {
    type: actionTypes.DISPLAY_NAME,
    displayName
  };
};

function setIsInstructor(isInstructor) {
  return {
    type: actionTypes.IS_INSTRUCTOR,
    isInstructor
  };
};

export default {setSignedIn, setUser, setDisplayName, setIsInstructor};