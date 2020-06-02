import _ from 'lodash';
import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView} from 'react-native';

import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_USER
} from '../redux/types';

//Native paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

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
		backgroundColor: "rgba(0,0,0,.75)",
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
			</View>
		);
	}
}
export default Layout;