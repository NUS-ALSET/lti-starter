import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import PublicHeader from './PublicHeader';

export const PublicLayout = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
	<div><PublicHeader /><Component {...props}/></div>
  )}/>
)