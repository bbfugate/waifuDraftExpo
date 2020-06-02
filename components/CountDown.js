import React, { Component, forwardRef } from 'react'
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, ImageBackground, Dimensions } from 'react-native';
import moment from 'moment';
require('moment-countdown');

const styles = StyleSheet.create({
	countdownWrapper:{
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
    flexDirection: 'row',
		fontFamily: "Edo",
		backgroundColor: "rgba(0,0,0,.5)"
	},
  countdownItem:{
		fontSize: 50,
		alignItems: "center",
		justifyContent: "center",
		flex:1
  },
	countdownItemText: {
		fontFamily: "Edo",
		fontSize: 25,
		fontWeight: "600",
		textTransform: "uppercase"
	},
	countdownBG: {
			flex: 1,
			height: 5,
			position: "absolute",
			top: "37px",
			/* left: 50%,
			transform: translate(-50%, -50%), */
			backgroundColor: "rgba(255, 255, 255, 0.31)",
			fontFamily: "Edo",
			/* transform-origin: center, */
			//animation: 3s cubic-bezier(0.06, 0.68, 0.03, 1.25) 1s countdown-BGGrow,
			//animation-fill-mode: forwards,
			//transform: scaleX(0)
	}
})

const { width, height } = Dimensions.get('window');
export default class Countdown extends Component {
  constructor(props) {
    super(props);
		this.state = {
			isActive: this.props.poll.isActive,
			activeTill: this.props.poll.activeTill,
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
			const now = moment();
			const then = moment(activeTill, timeFormat);
			const date = moment(then).countdown()
			const days = date.days;
			const hours = date.hours;
			const minutes = date.minutes;
			const seconds = date.seconds;

			this.setState({ days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillReceiveProps(props){
		this.setState({isActive: props.poll.isActive, activeTill: props.poll.activeTill , type: props.type})
		
		clearInterval(this.interval);
		this.interval = setInterval(() => {
			const { activeTill, timeFormat } = this.state;
			const now = moment();
			const then = moment(activeTill, timeFormat);
			const date = moment(then).countdown()
			const days = date.days.toString();
			const hours = date.hours.toString();
			const minutes = date.minutes.toString();
			const seconds = date.seconds.toString();

			this.setState({ days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillUnmount() {
		if (this.interval)
			clearInterval(this.interval);
	}

	render() {
		const { days, hours, minutes, seconds } = this.state;
		
		// if (!seconds) {
		// 	return null;
		// }

		return (
			<>
				<View style={styles.countdownWrapper}>
					<View style={styles.countdownItem}>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>{days}</Text>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>days</Text>
					</View>
					<View style={styles.countdownItem}>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>{hours}</Text>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>hours</Text>
					</View>
					<View style={styles.countdownItem}>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>{minutes}</Text>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>minutes</Text>
					</View>
					<View style={styles.countdownItem}>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>{seconds}</Text>
						<Text style={[styles.countdownItemText, {color: this.state.isActive ? "white" : "red" }]}>seconds</Text>
					</View>
					
					{/* <View style={styles.countdownBG}/> */}

					{/*{
						!this.state.isActive ?
							<View style={{height:"100%",position:"absolute", top:"50%", left:"calc(100% + 80px)", transform:"translate(-50%,-50%)"}}>
								<Text style={{textAlign:"center", color:"red", fontSize:50}}>CLOSED</Text>
							</View>
						:<></>
					} */}
				</View>
			</>
		);
	}
}