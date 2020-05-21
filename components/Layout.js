import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, Image } from 'react-native';
import { Video } from 'expo-av';

import watch from 'redux-watch'

//MUI Componets
import { responsiveFontSizes } from "@material-ui/core";
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Backdrop from '@material-ui/core/Backdrop';
import { ThemeProvider, makeStyles, withStyles } from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

//MUI Labs
import MuiAlert from '@material-ui/lab/Alert';

//Icons
import HomeIcon from '@material-ui/icons/Home';
import PageviewIcon from '@material-ui/icons/Pageview';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

//Redux
import store from '../redux/store';

/* import Navbar from './Navbar'; */
import themeObject from '../util/theme';

var wduTheme = responsiveFontSizes(createMuiTheme(themeObject));
const styles = wduTheme => ({
	container: {
			display: 'flex',
	},
	root: {
			display: 'flex',
	},
	backdrop: {
		zIndex: wduTheme.zIndex.drawer + 1,
		color: '#fff',
	},
	backgroundVideo: {
		position: "absolute",
		top: "50%",
		left: "50%",
		alignItems: "stretch",
		transform: "translate(-50%, -50%)",
		height: "200px",
		width: "200px"
	}
});

class Layout extends Component {
    static displayName = Layout.name;
    constructor(props) {
			super(props);
			this.state = {
				height: this.props.height,
				width: this.props.width,
				loading: false,
				open: false,
			};

			let uiReducerWatch = watch(store.getState, 'UI')
			store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
					this.setState({ ...newVal })
			}))

			this.handleDrawerToggle = this.handleDrawerToggle.bind(this)
    }

    handleDrawerToggle(){
      this.setState({ open: !this.state.open });
    };  

    componentDidMount() {
    }

    render() {
			const { classes } = this.props;

			return (
				<ThemeProvider theme={wduTheme}>
					{
						this.state.loading ?
						<View>
							<Image
							source={{uri: "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Loading.gif?alt=media&token=371cd83f-57f9-4802-98e1-241b067582b4"}}
							/* className="Loading" */ alt="Loading" />
						</View>
						: <></>
					}
					
					{/* <Backdrop className={classes.backdrop} open={this.state.loading}>
						<Image src={Loading} className="Loading" alt="Loading" />
					</Backdrop> */}

					{/* <Navbar/> */}
					<View style={{height:"100%", width:"100%", position:"relative", zIndex:1, backgroundColor:"black"}} /* className={"mainView"} */>
						{/* <div >
						{this.props.children}
						</div> */}
							<Video
								rate={1.0}
								volume={1.0}
								isMuted={false}
								resizeMode="cover"
								shouldPlay
								isLooping
								source={{uri: "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/WDUBG.mp4?alt=media&token=e8a99d1d-a81f-432c-8b4b-735d78ee8f00"}}
							/>

						<Text styles={{color:"white"}}>VIDEO</Text>
						{/*<Video autoPlay muted loop style={{ position: "absolute", width: "65%",
								left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
								<source src={videoBg} type="video/mp4" />
						</Video> */}
					</View>
				</ThemeProvider>
			);
    }
}

export default (withStyles(styles)(Layout));