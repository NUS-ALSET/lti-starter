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

export default {setSignedIn, setUser};