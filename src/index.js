import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  Switch
} from 'react-router-dom';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import userReducer from './reducers'

//const logger = createLogger();
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err);
    throw err;
  }
}

let store = createStore(userReducer, applyMiddleware(logger, crashReporter));

ReactDOM.render(
				<Provider store={store}>
					<Router>
						<Switch>
							<Route exact path="/" component={App} />
							<Route path="/ctoken/:id" component={App} />
						</Switch>
					</Router>
				</Provider>, 
				document.getElementById('root'));

registerServiceWorker();
