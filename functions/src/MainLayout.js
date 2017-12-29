import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import MainHeader from './MainHeader';

export const MainLayout = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
	<div><MainHeader /><Component {...props}/></div>
  )}/>
)