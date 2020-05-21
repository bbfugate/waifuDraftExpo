import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text } from 'react-native';
import { NativeRouter as Router, Route, Link } from "react-router-native";
import ReactDOM from 'react-dom';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import LinkingConfiguration from './navigation/LinkingConfiguration';

import axios from 'axios';

//Screens
import LoginSignUp from './screens/LoginSignUp';

//Components
import Layout from './components/Layout';

//Redux
import store from './redux/store';
import { Provider } from 'react-redux';

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

//MUI
import { ThemeProvider as MuiThemeProvider, makeStyles, withStyles } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import Backdrop from '@material-ui/core/Backdrop';

//Util
import themeObject from './util/theme';

require('./util/firebaseSetup')

const Stack = createStackNavigator();


axios.defaults.baseURL = 'https://us-central1-waifudraftunlimited.cloudfunctions.net/api';
//axios.defaults.baseURL = 'http://localhost:5000';

const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0, loading: true, authenticated: false };

    firebase.auth().onAuthStateChanged(async function(authUser) {
      if(authUser != null){
        /* localStorage.setItem('authUser', JSON.stringify(authUser));
        getUserData(await authUser.getIdToken()) */
        this.setState({authenticated: true})
      }
      else{
        /* store.dispatch({ type: SET_UNAUTHENTICATED });
        store.dispatch({ type: UNSUB_SNAPSHOTS }) */
        this.setState({authenticated: false})
      }
    }.bind(this));

    //this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    
    /*let userReducerWatch = watch(store.getState, 'user')
    store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ ...newVal })
    })) */
  }

  render(){
    return (
    <Provider store={store}>
      <Router>
        {this.state.authenticated ?
          <View>
            {/* <LoginSignUp/> */}
            <Text>Login</Text>
          </View>
          :
          <Layout/>
        }
      </Router>
    </Provider>
    );
  }
}

export default (withStyles(styles)(App));
