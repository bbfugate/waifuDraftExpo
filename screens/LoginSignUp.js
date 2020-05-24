import React, { Component, useState, useEffect } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import _ from 'lodash';
import firebase from 'firebase/app'
import 'firebase/auth'

import { SET_SNACKBAR } from '../redux/types';

import { loginUser, signupUser, validateLoginData, validateSignUpData } from '../redux/actions/userActions'

//Native Paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import Grid from '@material-ui/core/Grid';

//Redux stuff
import store from '../redux/store';
import watch from 'redux-watch';

//Components
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import { StylesProvider } from '@material-ui/core';

const { width, height } = Dimensions.get('window');
const FadeInView = props => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity: 0
  const [yPosition] = useState(new Animated.Value(-10)); // Initial value for opacity: 0

  React.useEffect(() => {
		Animated.sequence([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
			}),
			Animated.loop(
				Animated.sequence([
					Animated.timing(yPosition, {
						toValue: 10,
						duration: 3000,
						easing: Easing.cubic
					}),
					Animated.timing(yPosition, {
						toValue: -10,
						duration: 3000,
						easing: Easing.cubic
					}),
				]))
		]).start()
  }, []);

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
				opacity: fadeAnim, // Bind opacity to animated value
				transform: [
					{ translateY: yPosition }
				]
      }}>
      {props.children}
    </Animated.View>
  );
};

export class LoginSignUp extends Component {
	constructor() {
    super();
		this.state = {
			loading: store.getState().UI.loading,
			loginOpen: true,
		};

		this.toggleView = this.toggleView.bind(this);
		
		let uiReducerWatch = watch(store.getState, 'UI')
		store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({loading: newVal.loading })
		}))
	}

	toggleView(isLoginView){
		this.setState({ loginOpen: isLoginView});
	}

	onSwipeLeft(gestureState) {
		console.log("left")
		this.toggleView(false)
  }
 
  onSwipeRight(gestureState) {
		console.log("right")
		this.toggleView(true)
	}
	
	render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
		};
		
		return (
			<View style={{flex:1}}>
				<GestureRecognizer
					onSwipeLeft={(state) => this.onSwipeLeft(state)}
					onSwipeRight={(state) => this.onSwipeRight(state)}
					config={config}
					style={styles.container}
				>
					<FadeInView style={styles.imageContainer}>
						<Image style={styles.image} source={{uri: "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/WDU%20Icon.png?alt=media&token=97e6ca1d-35a0-49c8-bc4a-cfffe8da2160"}}/>
					</FadeInView>
					
					<View style={[this.state.loginOpen ? styles.LoginInView : styles.LoginOutOfView, {width,height, position:"absolute"}]} >
						<Login />
					</View>
					<View style={[this.state.loginOpen ? styles.SignUpOutOfView : styles.SignUpInView, {width,height, position:"absolute"}]} >
						<Signup />
					</View>
				</GestureRecognizer>
			</View>
		)
	}
}
  
export default LoginSignUp;

const styles = StyleSheet.create({
	container:{
		flex:1,
		alignItems: "center",
		justifyContent: "center",
		position: "relative"
	}
	,
	LoginInView: {
		left: 0
	},
	LoginOutOfView: {
		left: -width
	},
	SignUpInView: {
		left: 0
	},
	SignUpOutOfView: {
		left: width 
	},
	imageContainer:{
		width: width * .5,
		height: width * .5,
		position:"absolute",
		zIndex:1,
		top:25,
	},
	image:{
		flex:1
	},
	button:{
		marginTop: 15
	}
})
