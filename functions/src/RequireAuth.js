import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
/**
 * Higher-order component (HOC) to wrap restricted pages
 */
export default function RequireAuth(TargetComponent){
    class Restricted extends Component {
        componentWillMount() {
            this.checkAuthentication(this.props);
        }
        componentWillReceiveProps(nextProps) {
            if (nextProps.location !== this.props.location) {
                this.checkAuthentication(nextProps);
            }
        }
        checkAuthentication(params) {
            const { history } = params;
		
			console.log("Restricted");
			console.log(params);
			console.log(params.signedIn.signedIn);
			if (!params.signedIn.signedIn){
				history.replace({ pathname: '/signin' });
			}
        }
        render() {
            return (
				<TargetComponent {...this.props} />
			);
        }
    }
	
	function mapStateToProps(state) {
	
		console.log("mapStateToProps withRouter");
		const signedIn = state.signedIn;
		const user = state.user;
		const displayName = state.displayName;
		
		return {signedIn, user, displayName, redirectUrl: state.redirectUrl}
	}

    return withRouter(connect(mapStateToProps)(Restricted));
}