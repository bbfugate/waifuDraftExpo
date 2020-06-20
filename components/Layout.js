import _ from 'lodash';
import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView} from 'react-native';

import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import {
  LOADING_UI,
  STOP_LOADING_UI,
	SET_USER,
	SET_SNACKBAR
} from '../redux/types';

//Native paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

//Components
import Toast from '../components/Toast'

//Expo
import { Video } from 'expo-av';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

//Navigation
import BottomTabNavigator from '../navigation/BottomTabNavigator'

//Screens
import LoginSignUp from '../screens/LoginSignUp';

//Action
import { setRealTimeListeners } from '../redux/actions/dataActions';
import { setAuthorizationHeader } from '../redux/actions/userActions';

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

const { width, height } = Dimensions.get('window');
const loadingGif = "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Loading.gif?alt=media&token=371cd83f-57f9-4802-98e1-241b067582b4";

const styles = StyleSheet.create({
  container: {
		flex:1,
    position: "relative",
		//top: StatusBar.currentHeight,
  },
	video: {
		width: 300,
		height: 300,
	},
	image:{
		width: width * .8,
		height: width * .8
	},
	background: {
		height: height,
		width: width,
    alignItems: 'center',
    justifyContent: 'center',
		position:"absolute",
		zIndex: -1
	},
	loadingContainer:{
		width: width,
		height: height,
		justifyContent:"center",
		alignItems:"center",
		backgroundColor: "rgba(0,0,0,.15)",
		position: "absolute",
		zIndex: 10
	}
})

class Layout extends Component {
	static displayName = Layout.name;
	constructor(props) {
		super(props);
		this.state = {
			loading: store.getState().UI.loading,
			authUser: props.authUser
		};

		let uiReducerWatch = watch(store.getState, 'UI')
		this.uiUnsubscribe = store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ ...newVal })
		}))

		this.startListeners = _.debounce(this.startListeners, 500)
	}

	async componentDidMount() {
		this.startListeners(this.state)
	}

	startListeners = (props) => {
		store.dispatch({type: LOADING_UI})
		
		if(props.authUser != null){
			setAuthorizationHeader()
			setRealTimeListeners(props.authUser.uid)
			this.registerForPushNotificationsAsync(props.authUser.uid);
			// this._notificationSubscription = Notifications.addListener(this._handleNotification);
		}
		this.setState({...props})
		
		store.dispatch({type: STOP_LOADING_UI})
	}

	UNSAFE_componentWillReceiveProps(props){
		if(!_.isEqual(props.authUser, this.state.authUser))
			this.startListeners(props)
	}

	componentWillUnmount(){
		this.uiUnsubscribe()
	}

  registerForPushNotificationsAsync = async (userId) => {
		const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			console.log('Failed to get push token for push notification!');
			return;
		}
		
		token = await Notifications.getExpoPushTokenAsync();
		await firebase.firestore().doc(`users/${userId}`).get()
		.then((userRef) => {
			var user = userRef.data();

			if(user.token == undefined || user.token != token){ //add user token or update it if is different
				userRef.ref.update({token})
			}
		})

		if (Platform.OS === 'android') {
			Notifications.createChannelAndroidAsync('default', {
				name: 'default',
				sound: true,
				priority: 'max',
				vibrate: [0, 250, 250, 250],
			});
		}
  };

  // _handleNotification = notification => {
  //   Vibration.vibrate();
  //   console.log(notification);
  //   this.setState({ notification: notification });
	// };
	
	render() {
		return (
			<View style={styles.container}>
				{this.state.loading ? 
					<View style={styles.loadingContainer}>
						<Image style={styles.image} source={{uri: loadingGif}} />
					</View>
				: <></>
				}


				<>
					{this.state.authUser == null ? 
						<LoginSignUp />
					:
						<BottomTabNavigator />
					}
				</>
				
				<Toast/>
			</View>
		);
	}
}
export default Layout;