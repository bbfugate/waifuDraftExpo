import * as WebBrowser from 'expo-web-browser';
import React, { Component, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, ImageBackground, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

//Redux
import store from '../redux/store';
import watch from 'redux-watch'
import { useSelector } from 'react-redux';

//Component
import Countdown from '../components/CountDown'

//Native Paper
import Carousel from 'react-native-looped-carousel';
import {Carousel as snapCarousel,  ParallaxImage, Pagination  } from 'react-native-snap-carousel';

const { width, height } = Dimensions.get('window');
export default class Home extends Component {
  constructor(props) {
		super();
    this.state = {
      loading: store.getState().UI.loading,
      navigation: props.navigation,
			userInfo: store.getState().user.credentials,
			weeklyPoll: store.getState().data.poll.weekly,
			dailyPoll: store.getState().data.poll.daily,
      weeklyWaifus: store.getState().data.weeklyPollWaifus,
			dailyPollWaifus: store.getState().data.dailyPollWaifus,
      activeSlide: 0,
      size: { width, height }
    };

		let dataReducerWatch = watch(store.getState, 'data')
		let userReducerWatch = watch(store.getState, 'user')
		let uiReducerWatch = watch(store.getState, 'UI')

		store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
			//newVal.weeklyPollWaifus = this.setHasVoted(newVal.weeklyPollWaifus)
			this.setState({ ...newVal, weeklyPoll: newVal.poll.weekly, dailyPoll: newVal.poll.daily, })
      /*if(this.state.card != null){
				if(this.state.card.husbando == "Poll")
					this.showWeeklyCardDetails(newVal.weeklyPollWaifus.filter(x => x.waifuId == this.state.card.waifuId)[0])
				else
					this.showDailyCardDetails(newVal.dailyPollWaifus.filter(x => x.waifuId == this.state.card.waifuId)[0])
			} */
		}))

		store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ userInfo: newVal.credentials })
    }))
    
		store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
      console.log(newVal.loading)
			this.setState({ loading: newVal.loading })
		}))
  }

  _onLayoutDidChange = e => {
    const layout = e.nativeEvent.layout;
    this.setState({ size: { width: layout.width, height: layout.height } });
  };
  
  _renderItem (item, index) {
    console.log(item.img)
    return (
      <View style={styles.container}>
        <ImageBackground source={{ uri: item.img}} style={styles.image}>
          <Text style={styles.text}>Inside</Text>
        </ImageBackground>
      </View>
    );
  }

  /*useSelector( state => {
		var dataState = state.data;
		if(dataState.weeklyPollWaifus != null && dataState.weeklyPollWaifus.length > 0)
			setWeeklyWaifus(dataState.weeklyPollWaifus)
  });*/

  render(){
    return (
      <>
        {this.state.loading ?
          <View style={{ flex: 1, alignItems:"center", justifyContent:"center"}}>
            <Image source={{uri: "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Loading.gif?alt=media&token=371cd83f-57f9-4802-98e1-241b067582b4"}} />
          </View>
        :
          <View style={{ flex: 1, position:"relative"}}>
            {/* <View style={styles.countDown}>
              <Countdown poll={this.state.weeklyPoll} type={"WEEKLY"}/>
            </View> */}

            <View style={{flex:1}} onLayout={this._onLayoutDidChange}>
              <Carousel
                style={this.state.size}
                pageInfo={false}
                autoplay={false}
                currentPage={0}
                onAnimateNextPage={p => console.log(p)}>
                  {this.state.weeklyWaifus.map((x,index) => {
                    var item = x;
                    return(
                      <View style={{flex:1}}>
                        {this._renderItem(item,index)}
                      </View>
                    )
                  })}
              </Carousel>
            </View>
          </View>
        }
      </>
    );
  }
}

Home.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  countDown:{
    width: width,
    position: "absolute",
    zIndex:1
  },
  item: {
    width: width - 60,
    height: width - 60,
  },
  imageContainer: {
    flex: 1,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: 'white',
    flexDirection: "column"
    //borderRadius: 8,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor:"transparent"
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  text: {
    color: "grey",
    fontSize: 30,
    fontWeight: "bold"
  }
})