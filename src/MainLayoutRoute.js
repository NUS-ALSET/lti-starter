import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import MainHeader from './MainHeader';

const user = JSON.parse(localStorage.getItem('user'));

// wrapping/composing
export const MainLayoutRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
		user
		? <div><MainHeader /><Component {...props}/></div>
		: <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />
  )}/>
)