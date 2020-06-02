import React, { Component, PureComponent, createRef, forwardRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, ImageBackground, Dimensions, Animated, Easing } from 'react-native';

const chroma = require('chroma-js')

const { Value, timing } = Animated;

const { width, height } = Dimensions.get('window');
export default class RankGradient extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      rank: props.rank,
      rankColor: "#ff0000",
    }
    this.fadeAnim = new Value(0);
  }
  
  componentDidMount(){
    var rankColor = "#ff0000";
    
    switch(this.state.rank){
      case 1:
        rankColor = "#ff0000"
        break;
      case 2:
        rankColor = "#835220"
        break;
      case 3:
        rankColor = "#7b7979"
        break;
      case 4:
        rankColor = "#b29600"
        break;
    }

    this.setState({ rankColor })
  }

  componentWillReceiveProps(props){
    var rankColor = "#ff0000";
    
    switch(props.rank){
      case 1:
        rankColor = "#ff0000"
        break;
      case 2:
        rankColor = "#835220"
        break;
      case 3:
        rankColor = "#7b7979"
        break;
      case 4:
        rankColor = "#b29600"
        break;
    }

    this.setState({rank: props.rank, rankColor})
  }

  render() {
    return (
      <View style={[styles.container]}>
        <View style={[styles.bgContainer, {backgroundColor: this.state.rankColor}]}/>
        <Text style={styles.title} numberOfLines={2}>
          { this.state.name }
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgContainer: {
    position: "relative",
    width: width * .8,
    height: 75,
    maxHeight: 75,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    opacity: .5
  },
  title:{
    color:"white",
    fontFamily: "Edo",
    fontSize: 30,
    textAlign: "center",
    position: "absolute"
  },
});