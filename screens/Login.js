import React, { Component, useState, useEffect } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';

import _ from 'lodash';
import firebase from 'firebase/app'
import 'firebase/auth';

import { validateLoginData } from '../redux/actions/userActions'

// Native Paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

// Redux stuff
import watch from 'redux-watch'
import store from '../redux/store';
import { LOADING_UI, STOP_LOADING_UI } from '../redux/types';

const { width, height } = Dimensions.get('window');
export class Login extends Component {
	constructor() {
    super();
		this.state = {
			loading: store.getState().UI.loading,
			email: '',
			password: '',
		};
		
		let uiReducerWatch = watch(store.getState, 'UI')
		this.uiUnsubscribe = store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({loading: newVal.loading })
		}))
	}

	emailChange = (text) => {
		this.setState({ email: text });
	}
	passwordChange = (text) => {
		this.setState({ password: text });
	}

	userNameLoginSubmit = (event) => {
		store.dispatch({type: LOADING_UI})

		event.preventDefault();
		const userData = {
			email: this.state.email,
			password: this.state.password
		};

		const { valid, errors } = validateLoginData(userData);
		if (!valid){
			console.log(errors)
			/*store.dispatch({
				type: SET_SNACKBAR,
				payload: errors
			}); */
			return;
		}
	
		// firebase.firestore().collection("users").where("email", "==", userData.email).get()
		// .then((data) => {
		// 	if(data.empty){
		// 		throw new Error("No Account Exists")
		// 	}
	
		// 	return firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
		// })
		firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
		.then(async (data) => {
			var uid = await firebase.auth().currentUser.uid;
			var userRec = await firebase.firestore().doc(`/users/${uid}`).get();
	
			if(!userRec.data().isActive){
				throw new Error("This Account Is Not Active")
			}
		})
		.catch((err) => {
			store.dispatch({type: STOP_LOADING_UI})
			console.log(err.code);
			var errors = [];
	
			if (err.code === 'auth/wrong-password')
				errors.push({type:"error", message:'Wrong login details, please try again'})
			else
				errors.push({type:"error", message: err.message});
	
			/*store.dispatch({
				type: SET_SNACKBAR,
				payload: errors
			}); */
		})
	}

	async componentDidMount(){
	}
	componentWillMount(){
		this.uiUnsubscribe()
	}

	render() {
		return (
			<View style={styles.container}>
				<TextInput
					label="Email"
					underlineColor= "teal"
					style={styles.textField}
					value={this.state.email}
					mode="Outlined"
					onChangeText={this.emailChange}
				/>
				<TextInput
					label="Password"
					underlineColor= "teal"
					secureTextEntry={true}
					mode="Outlined"
					style={styles.textField}
					value={this.state.password}
					onChangeText={this.passwordChange}
				/>
				
				<View>
					<Button style={styles.button} color={"teal"} mode="contained" onPress={this.userNameLoginSubmit}>
						Login
					</Button>
				</View>
			</View>
		)
	}
}
  
export default Login;

const styles = StyleSheet.create({
  container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
    flexDirection: "column",
		backgroundColor:"white",
		position: "relative"		
	},
	signup:{
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 8
	},
  pageTitle:{
		marginTop: 10,
		marginBottom: 10
  },
	textField: {
		marginTop: 3,
		marginBottom: 3,
		width: width * .85,
		backgroundColor: "white"
	},
	button: {
		marginTop: 20,
		position: 'relative'
	},
	progress: {
		position: 'absolute'
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
