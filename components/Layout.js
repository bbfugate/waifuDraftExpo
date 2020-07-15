import _ from 'lodash';
import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView, AppState} from 'react-native';

import {
  LOADING_UI,
  STOP_LOADING_UI,
	SET_USER,
	UNSUB_SNAPSHOTS,
	SET_SNACKBAR
} from '../redux/types';

//Native paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

//Components
import Toast from '../components/Toast'

//Expo
import { Notifications } from 'expo';
import { Video } from 'expo-av';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

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
			authUser: props.authUser,
			appState: AppState.currentState
		};

		this.startListeners = _.debounce(this.startListeners, 500)
	}

  _handleAppStateChange = async (nextAppState) => {
    if ((this.state.appState.match(/inactive|background/) && nextAppState === 'active') || (this.state.appState == "active" && nextAppState == undefined)) {
			this.startListeners(this.state)
	
			let uiReducerWatch = watch(store.getState, 'UI')
			this.uiUnsubscribe = store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
				this.setState({ ...newVal })
			}))

			try {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
	
					store.dispatch({
						type: SET_SNACKBAR,
						payload: { type: "success", message: "New Update Avalible. Applying..." }
					});
	
					//... notify user of update...
					this.setState(async () => {
						await Updates.reloadAsync();
					}, 1000)
				}
				else{
					console.log("No Update")
				}
			}
			catch (e) {
				// handle or log error
				// store.dispatch({
				// 	type: SET_SNACKBAR,
				// 	payload: { type: "error", message: "Error Applying Update" }
				// });
			}
		}
		else{
			store.dispatch({ type: UNSUB_SNAPSHOTS });

			if(this.uiUnsubscribe != null){
				this.uiUnsubscribe()
			}
		}

    this.setState({appState: nextAppState});
	}
	
	async componentDidMount() {
		AppState.addEventListener('change', this._handleAppStateChange);
		
		this._handleAppStateChange();
	}

  componentWillUnmount(){
    AppState.addEventListener('change', this._handleAppStateChange);
    this.mounted = false;
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

  registerForPushNotificationsAsync = async (userId) => {
		try{
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
			.catch((err) => {
				// store.dispatch({type: SET_SNACKBAR, payload: {type:"error", message: "cant set token"}});
			})

			if (Platform.OS === 'android') {
				Notifications.createChannelAndroidAsync('default', {
					name: 'default',
					sound: true,
					priority: 'max',
					vibrate: [0, 250, 250, 250],
				});
			}
		}
		catch(err){
			// store.dispatch({type: SET_SNACKBAR, payload: {type:"info", message: "Error getting permissions"}});
			await firebase.firestore().collection("logs").add({log: err, timestamp: new Date()})
			.catch((err) => {
				store.dispatch({type: SET_SNACKBAR, payload: {type:"error", message: "Error adding error log"}});
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