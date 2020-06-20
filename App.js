import 'react-native-gesture-handler';
import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView} from 'react-native';

import { NativeRouter as Router, Route, Link } from "react-router-native";
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

import _ from 'lodash';
import axios from 'axios';

//Expo
import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

//Native paper
import { 
  Provider as PaperProvider, 
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme 
} from 'react-native-paper';

//Components
import Layout from './components/Layout'

//Redux
import store from './redux/store';
import watch from 'redux-watch'
import { Provider } from 'react-redux';
import { SET_UNAUTHENTICATED, UNSUB_SNAPSHOTS, STOP_LOADING_UI} from './redux/types';

//Actions
import { setAuthorizationHeader } from './redux/actions/userActions';

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

require('./util/firebaseSetup')
console.disableYellowBox = true;

axios.defaults.baseURL = 'https://us-central1-waifudraftunlimited.cloudfunctions.net/api';

let Window = Dimensions.get('window');
const styles = StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    position: "relative",
  },
	video: {
		width: 300,
		height: 300,
	},
	background: {
		height: Window.height,
		width:Window.width,
    alignItems: 'center',
    justifyContent: 'center',
		position:"absolute",
		zIndex: -1
	},
  view:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  }
})

const CustomDefaultTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
    background: '#ffffff',
    text: '#333333'
  }
}

export default class App extends Component{
  constructor(){
    super();
    this.state = {
      isLoadingComplete: false,
      isAuthenticationReady: false,
      authUser: false,
    };
    
    this.onAuthStateChanged = _.debounce(this.onAuthStateChanged, 1000)
    
    let userReducerWatch = watch(store.getState, 'user')
    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ ...newVal })
    }))
  }
  
  onAuthStateChanged = (user) => {
    this.setState({isAuthenticationReady: true, authUser: user});
  }

  componentDidMount(){
    SplashScreen.preventAutoHideAsync();
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }

  componentWillUnmount(){
    this.userUnsubscribe()
    store.dispatch({ type: UNSUB_SNAPSHOTS });
  }

  _cacheSplashResourcesAsync = async () => {
    const gif = require('./assets/images/splash.gif');
    return Asset.fromModule(gif).downloadAsync();
  };

  _cacheResourcesAsync = async () => {
    SplashScreen.hideAsync();

    Promise.all([
      Asset.loadAsync([
        require('./assets/videos/DCBg.mp4'),
        require('./assets/videos/MarvelBg.mp4'),
        require('./assets/images/TopVote.png'),
      ]),
      Font.loadAsync({
        Edo: require('./assets/fonts/edo.ttf'),
        TarrgetLaser: require('./assets/fonts/tarrgetlaser.ttf'),
      }),
    ]);
    
    this.setState({ isLoadingComplete: true });
  };

  render(){
    if (!this.state.isLoadingComplete || !this.state.isAuthenticationReady) {
      return (
        <View style={{ flex: 1 }}>
          <Image
            style={{flex:1}}
            source={require('./assets/images/splash.gif')}
            onLoad={ this._cacheResourcesAsync }
          />
        </View>
      );
    }

    return (
      <Provider store={store}>
        <Router>
          <PaperProvider theme={CustomDefaultTheme}>
            <SafeAreaView style={styles.droidSafeArea}>
              <Layout authUser={this.state.authUser} />
            </SafeAreaView>
          </PaperProvider>
        </Router>
      </Provider>
    );
  }
}