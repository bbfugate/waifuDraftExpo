import 'react-native-gesture-handler';
import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

import { NativeRouter as Router, Route, Link } from "react-router-native";
import { 
  NavigationContainer, 
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';

import axios from 'axios';
import _ from "lodash";

//Expo
import { Video } from 'expo-av';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

//Navigation
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

//Native paper
import { 
  Provider as PaperProvider, 
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme 
} from 'react-native-paper';

//Screens
import LoginSignUp from './screens/LoginSignUp';

//Screens
import HomeScreen from './screens/Home';
import DetailsScreen from './screens/Details';
import SearchScreen from './screens/Search';

//Redux
import store from './redux/store';
import { Provider } from 'react-redux';
import watch from "redux-watch";
import { SET_UNAUTHENTICATED, UNSUB_SNAPSHOTS, STOP_LOADING_UI} from './redux/types';

//Actions
import { logoutUser, getUserData } from './redux/actions/userActions';

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

require('./util/firebaseSetup')
console.disableYellowBox = true;

//axios.defaults.baseURL = 'https://us-central1-waifudraftunlimited.cloudfunctions.net/api';
axios.defaults.baseURL = 'http://localhost:5000/';

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

const Tab = createMaterialBottomTabNavigator(); //Bottom Tab Navigator

const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
      initialRouteName={"Home"}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Details" component={DetailsScreen} />
    </HomeStack.Navigator>
  );
}

const SearchStack = createStackNavigator();
function SearchStackScreen() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <SearchStack.Screen name="Search" component={SearchScreen} />
    </SearchStack.Navigator>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:"transparent" }}>
      <Text>Settings screen</Text>
      <Button mode="contained" 
        onPress={() => {
          delete axios.defaults.headers.common['Authorization'];
          firebase.auth().signOut()
        }}
      >
        Log Out
      </Button>
    </View>
  );
}
const SettingsStack = createStackNavigator();
function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}


let Window = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
		flex:1,
    position: "relative",
    backgroundColor: "black",
		//top: StatusBar.currentHeight,
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
    flex:1
  }
})

_loadResourcesAsync = async () => {
  return Promise.all([
    Font.loadAsync({
      ...Ionicons.font,
      'Edo': require('./media/fonts/edo.ttf'),
      'TarrgetLaser': require('./media/fonts/tarrgetlaser.ttf'),
    }),
  ]);
};

const App = ({ navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);
  
  let uiReducerWatch = watch(store.getState, 'UI')
  store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
    setLoading(newVal.loading)
  }))

  firebase.auth().onAuthStateChanged(async function(authUser) {
    if(authUser != null){
      console.log("-------------------Authenticate")
      setAuthenticated(true)
      getUserData(await authUser.getIdToken(), authUser.uid)
    }
    else{
      console.log("Unauthenticate")
      store.dispatch({ type: SET_UNAUTHENTICATED });
      store.dispatch({ type: UNSUB_SNAPSHOTS })
      store.dispatch({ type: STOP_LOADING_UI })
    }
  });

  return (
    <Provider store={store}>
      <Router>
        <PaperProvider theme={CustomDefaultTheme}>
          {
            loading ?
            <></>
            :
            <View style={styles.container}>
              {/*<View style={[styles.background]}>
                <Video
                  style={[styles.video]}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="contain"
                  shouldPlay
                  isLooping
                  source={{uri: "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/WDUBG.mp4?alt=media&token=e8a99d1d-a81f-432c-8b4b-735d78ee8f00"}}
                />
              </View> */}

              {!authenticated ?
                <View style={styles.view}>
                  <LoginSignUp/>
                </View>
              :
                <View style={styles.view}>
                  <NavigationContainer>
                    <Tab.Navigator
                      initialRouteName="Home"
                      barStyle={{ backgroundColor: '#14DFC9' }}
                    >
                      <Tab.Screen name="Settings" component={SettingsStackScreen} />
                      <Tab.Screen name="Home" component={HomeStackScreen} />
                      <Tab.Screen name="Search" component={SearchStackScreen} />
                    </Tab.Navigator>
                  </NavigationContainer>
                </View>
              }
            </View>
          }
        </PaperProvider>
      </Router>
    </Provider>
  );
}

export default App;