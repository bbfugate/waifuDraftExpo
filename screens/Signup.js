import React, { Component, useState, useEffect } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import _ from 'lodash';
import firebase from 'firebase/app'
import 'firebase/auth';

import { validateSignUpData } from '../redux/actions/userActions'

// Native Paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

// Redux stuff
import watch from 'redux-watch'
import store from '../redux/store';

const { width, height } = Dimensions.get('window');
export class Signup extends Component {
	constructor() {
    super();
		this.state = {
			loading: store.getState().UI.loading,
			email: '',
			password: '',
			confirmPassword: '',
			userName: '',
			pin: '',
			errors: {},
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
	confirmPasswordChange = (text) => {
		this.setState({ confirmPassword: text });
	}
	userNameChange = (text) => {
		this.setState({ userName: text });
	}
	pinChange = (text) => {
		var letters = /^[A-Za-z]+$/;
		if(text.match(letters)){
			//Pin can only have numbers        
			var errors = this.state.errors;
			errors.pin = "Pin can only contain numbers";

			this.setState({ errors, loading: false })
			return;
		}

		this.setState({ pin: text });
	}

	userNameSignUpSubmit = async (event) => {
		event.preventDefault();
		this.setState({ loading: true });

		if(this.state.pin.length < 4){
			//error pin needs to be 4 numbers long
			var errorsTemp = this.state.errors;
			errorsTemp.pin = "Pin must be atleast 4 digits long";

			this.setState({ errors: errorsTemp, loading: false })
			return;
		}

		const newUserData = {
			email: this.state.email,
			password: this.state.password,
			confirmPassword: this.state.confirmPassword,
			userName: this.state.userName,
			pin: this.state.pin
		};

	
		const { valid, errors } = validateSignUpData(newUserData);
		if (!valid){
			var errorList = [];
			errors.forEach(x => {
				errorList.push({type: "error", message: x})
			})
	
			store.dispatch({
				type: SET_SNACKBAR,
				payload: errorList
			});
			return;
		}

		let token, userId;
		firebase.auth().createUserWithEmailAndPassword(newUserData.email, newUserData.password)
		.then((data) => {
			userId = data.user.uid;
			var idToken = data.user.getIdToken();
			return idToken;
		})
		.then((idToken) => {
			token = idToken;
			const userCreds = {
				userName: newUserData.userName,
				email: newUserData.email,
				img: `https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/no-img.png?alt=media`,
				createdDate: new Date(),
				isAdmin: false,
				isWinner: false,
				points: 5,
				statCoins: 0,
				rankCoins: 0,
				submitSlots: 0,
				isActive: true,
				pin: newUserData.pin
			};
	
			return firebase.firestore().doc(`/users/${userId}`).set(userCreds);
		})
		.then(() => {
			store.dispatch({
				type: SET_SNACKBAR,
				payload: [{ type: "success", message:'Your Account Has Been Created' }]
			});
			this.setState({
				loading: store.getState().UI.loading,
				loginOpen: true,
				email: '',
				password: '',
				confirmPassword: '',
				userName: '',
				pin: '',
				errors: {},
			})
		})
		.catch(err => {
			console.error(err);
			if (err.code === 'auth/email-already-in-use') {
				store.dispatch({
					type: SET_SNACKBAR,
					payload: [{ type: "error", message:'Email is already in use' }]
				});
			}
			else {
				store.dispatch({
					type: SET_SNACKBAR,
					payload: [{ type: "error", message: err.code }]
				});
			}
		});
	}
	
	componentWillMount(){
		this.uiUnsubscribe()
	}
	
	render() {
		return (
			<View style={styles.container}>
				<TextInput
					id="email"
					name="email"
					type="email"
					label="Email"
					underlineColor= "teal"
					style={styles.textField}
					value={this.state.email}
					onChangeText={this.emailChange}
				/>
				<TextInput
					id="password"
					name="password"
					type="password"
					label="Password"
					underlineColor= "teal"
					style={styles.textField}
					value={this.state.password}
					onChangeText={this.passwordChange}
				/>
				<TextInput
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					label="Confirm Password"
					underlineColor= "teal"
					style={styles.textField}
					value={this.state.confirmPassword}
					onChangeText={this.confirmPasswordChange}
					fullWidth
				/>
				<TextInput
					id="userName"
					name="userName"
					type="text"
					label="UserName"
					underlineColor= "teal"
					style={styles.textField}
					value={this.state.userName}
					onChangeText={this.userNameChange}
				/>
				<TextInput
					id="pin"
					name="pin"
					type="text"
					label="Pin"
					underlineColor= "teal"
					style={styles.textField}
					value={this.state.pin}
					onChangeText={this.pinChange}
				/>
				
				<View>
					<Button style={styles.button} color={"teal"} mode="contained" onPress={this.userNameSignUpSubmit}>
						SignUp
					</Button>
				</View>
			</View>
		)
	}
}
  
export default Signup;

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
