import React, { Component, useState, useEffect } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

//Native Paper
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

//Components
import Login from '../screens/Login';
import Signup from '../screens/Signup';

//Redux
import store from '../redux/store';
import watch from "redux-watch";

const { width, height } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

const FadeInView = props => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity: 0
  const [yPosition] = useState(new Animated.Value(-10)); // Initial value for opacity: 0

  React.useEffect(() => {
		Animated.sequence([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
			}),
			Animated.loop(
				Animated.sequence([
					Animated.timing(yPosition, {
						toValue: 10,
						duration: 3000,
						easing: Easing.linear
					}),
					Animated.timing(yPosition, {
						toValue: -10,
						duration: 3000,
						easing: Easing.linear
					}),
				]))
		]).start()
  }, []);

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
				opacity: fadeAnim, // Bind opacity to animated value
				transform: [
					{ translateY: yPosition }
				]
      }}>
      {props.children}
    </Animated.View>
  );
};

export class LoginSignUp extends Component {
	constructor() {
    super();
		this.state = {};
	}
	render() {
		return (
			<View style={{flex:1}}>
				{/* <FadeInView style={styles.imageContainer}>
					<Image style={styles.image} source={{uri: "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/WDU%20Icon.png?alt=media&token=97e6ca1d-35a0-49c8-bc4a-cfffe8da2160"}}/>
				</FadeInView> */}
				
				<NavigationContainer>
					<Tab.Navigator
						tabBar={() => null}
						swipeEnabled={true}
					>
					<Tab.Screen name="Login" component={Login} />
					<Tab.Screen name="SignUp" component={Signup} />
					</Tab.Navigator>
				</NavigationContainer>
			</View>
		)
	}
}
  
export default LoginSignUp;

const styles = StyleSheet.create({
	container:{
		flex:1,
		position: "relative"
	},
	imageContainer:{
		width: width/2,
		height: width/2,
		position:"absolute",
		zIndex:1,
		top:25,
		left: (width/4)
	},
	image:{
		flex:1
	},
})
