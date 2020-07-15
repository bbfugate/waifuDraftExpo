import React, { Component, forwardRef } from 'react'
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, ImageBackground, Dimensions } from 'react-native';
import moment from 'moment';
require('moment-countdown');
const chroma = require('chroma-js')

const styles = StyleSheet.create({
	countdownWrapper:{
		height: 80,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
    flexDirection: 'row',
		fontFamily: "Edo",
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		backgroundColor: chroma('black').alpha(.5)
	},
  countdownItem:{
		fontSize: 50,
		alignItems: "center",
		justifyContent: "center",
		height: '100%',
		flex:1,
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
  },
	countdownItemText: {
		fontFamily: "Edo",
		fontSize: 25,
	},
})

const { width, height } = Dimensions.get('window');
export default class Countdown extends Component {
  constructor(props) {
		super(props);
		
		var isActive = moment(this.props.activeTill, "MM DD YYYY, h:mm a").toDate() > moment().toDate();
		if(this.props.type == "DAILY")
			isActive = this.props.isActive

		this.state = {
			isActive,
			activeTill: this.props.activeTill,
			timeFormat:"MM DD YYYY, h:mm a",
			days: undefined,
			hours: undefined,
			minutes: undefined,
			seconds: undefined,
			type: this.props.type
		};
	}

	componentDidMount() {
		this.interval = setInterval(() => {
			const { activeTill, timeFormat } = this.state;
			const then = moment(activeTill, timeFormat);
			const date = moment(then).countdown()
			const days = date.days;
			const hours = date.hours;
			const minutes = date.minutes;
			const seconds = date.seconds;

			var isActive = moment(activeTill, timeFormat).toDate() > moment().toDate();

			if(this.state.type == "DAILY")
				isActive = this.state.isActive

			this.setState({ isActive, days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillReceiveProps(props){
		this.setState({activeTill: props.activeTill, type: props.type})
		
		clearInterval(this.interval);
		this.interval = setInterval(() => {
			const { activeTill, timeFormat } = this.state;
			const then = moment(activeTill, timeFormat);
			const date = moment(then).countdown()
			const days = date.days.toString();
			const hours = date.hours.toString();
			const minutes = date.minutes.toString();
			const seconds = date.seconds.toString();

			var isActive = moment(activeTill, timeFormat).toDate() > moment().toDate();
			if(props.type == "DAILY")
				isActive = props.isActive

			this.setState({ isActive, days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillUnmount() {
		if (this.interval)
			clearInterval(this.interval);
	}

	render() {
		const { days, hours, minutes, seconds } = this.state;

		return (
			<>
				<View style={styles.countdownWrapper}>
					{this.state.isActive ?
						<>
							<View style={styles.countdownItem}>
								<Text style={[styles.countdownItemText, {color: "white"}]}>{days}</Text>
								<Text style={[styles.countdownItemText, {color: "white"}]}>days</Text>
							</View>
							<View style={styles.countdownItem}>
								<Text style={[styles.countdownItemText, {color: "white"}]}>{hours}</Text>
								<Text style={[styles.countdownItemText, {color: "white"}]}>hours</Text>
							</View>
							<View style={styles.countdownItem}>
								<Text style={[styles.countdownItemText, {color: "white"}]}>{minutes}</Text>
								<Text style={[styles.countdownItemText, {color: "white"}]}>mins</Text>
							</View>
							<View style={styles.countdownItem}>
							<Text style={[styles.countdownItemText, {color: "white"}]}>{seconds}</Text>
							<Text style={[styles.countdownItemText, {color: "white"}]}>secs</Text>
						</View>
						</>
						:
							<View style={[styles.countdownItem, {backgroundColor: chroma('white')} ]}>
								<Text style={{textAlign:"center", color:"red", fontSize:50, fontFamily:"Edo"}}>CLOSED</Text>
							</View>
					}
				</View>
			</>
		);
	}
}