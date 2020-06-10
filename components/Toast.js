import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, TouchableRipple, Snackbar } from 'react-native-paper';

import store from '../redux/store';
import watch from 'redux-watch'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');
export default class SnackBar extends React.Component {
  constructor(props){
    super(props);
    this.state={
      visible: false,
      message: "",
      type: "info",
      alertColor: "#4D68FF",
      duration: Snackbar.DURATION_SHORT
    };
    
    let uiReducerWatch = watch(store.getState, 'UI')
    store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
      if(newVal.snackBar == null)
        return

      this.setState({ visible: false })

      var snack = newVal.snackBar;
      var type = snack.type;
      var message = snack.message;
      var alertColor = "";

      switch(type.toLowerCase()){
        case "info":
          alertColor = "#4D68FF"
          break;
        case "success":
          alertColor = "#59EE87"
          break;
        case "warning":
          alertColor = "#F2E043"
          break;
        case "error":
          alertColor = "#F73A27"
          break;
      }

      this.setState({ visible: true, message, type, alertColor })
    }))
  }

  _onDismissSnackBar = () => this.setState({ visible: false });

  render(){
    return(
      <View style={[styles.container, {zIndex: this.state.visible ? 1000 : -2}]}>
        <Snackbar
          visible={this.state.visible}
          duration={this.state.duration}
          style={{
            backgroundColor: this.state.alertColor
          }}
          onDismiss={this._onDismissSnackBar}
        >
          {this.state.message}
        </Snackbar>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    width: width,
    justifyContent: 'space-between',
    position:"absolute",
    bottom: 5
  },
});