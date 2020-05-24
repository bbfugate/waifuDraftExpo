import React, { Component, forwardRef } from 'react'
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, ImageBackground, Dimensions } from 'react-native';
import moment from 'moment';
require('moment-countdown');

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
		
		if (!seconds) {
			return null;
		}

		return (
			<>
				<View container alignItems="center" justify="center" style={{flex:1}}>
					<View container alignItems="center" justify="center" style={{flex:.5}}>
						<View className="countdown-wrapper" style={{ color: this.state.isActive ? "white" : "red" }}>
							<View className="countdown-item">
								{days}
								<Text>days</Text>
							</View>
							<View className="countdown-item">
								{hours}
								<Text>hours</Text>
							</View>
							<View className="countdown-item">
								{minutes}
								<Text>minutes</Text>
							</View>
							<View className="countdown-item">
								{seconds}
								<Text>seconds</Text>
							</View>

							<View className="countdown-BG"/>
							<View style={{height:"100%",position:"absolute", top:"50%", right:"calc(100% - 50px)", transform:"translate(-50%,-50%)"}}>
								<Text style={{textAlign:"center", color:"white", fontFamily:"Edo", fontSize:"50px"}}>{this.state.type}</Text>
							</View>

							{
								!this.state.isActive ?
									<View style={{height:"100%",position:"absolute", top:"50%", left:"calc(100% + 80px)", transform:"translate(-50%,-50%)"}}>
										<Text style={{textAlign:"center", color:"red", fontFamily:"Edo", fontSize:"50px"}}>CLOSED</Text>
									</View>
								:<></>
							}
						</View>

					</View>
				</View>
			</>
		);
	}
}