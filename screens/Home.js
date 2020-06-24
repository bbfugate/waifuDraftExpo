import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, Vibration, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import _ from 'lodash'
import Swiper from 'react-native-swiper'

//Redux
import store from '../redux/store';
import watch from 'redux-watch'
import { useSelector } from 'react-redux';

//Component
import Countdown from '../components/CountDown'
import RankBackground from '../components/RankBackGround'

//Media
import TopVote from '../assets/images/TopVote.png'

//Native Paper
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';

const { width, height } = Dimensions.get('window');

const chroma = require('chroma-js')
const WaifuImg = ({item, parallaxProps, onPress}) => {
  const img = item.img
  const rank = item.rank
  const name = item.name
  const pressFunc = onPress

  return(
    <TouchableOpacity onPress={() => pressFunc(item.waifuId)} style={styles.item}>
      {/* <Image
        source={{ uri: img }}
        style={styles.image}
      /> */}
      <ParallaxImage
          source={{ uri: img }}
          containerStyle={styles.imageContainer}
          style={styles.image}
          parallaxFactor={0.4}
          {...parallaxProps}
        />
      <View style={styles.titleView}>
        <Example rank={rank} name={name} />
      </View>
    </TouchableOpacity>
  );
}

class CarouselItem extends PureComponent{
  constructor(props){
    super();
    this.state = {
      item: props.item,
      parallaxProps: props.parallaxProps,
      onPressCarousel: props._onPressCarousel
    }
  }

	UNSAFE_componentWillReceiveProps(props){
    this.setState({
      item: props.item,
      parallaxProps: props.parallaxProps,
      onPressCarousel: props._onPressCarousel
    })
	}

  render(){
    return(
      <TouchableOpacity onPress={() => this.state.onPressCarousel(this.state.item.waifuId)} style={styles.item}>
        <ParallaxImage
          source={{ uri: this.state.item.img }}
          containerStyle={styles.imageContainer}
          style={styles.image}
          parallaxFactor={0.4}
          {...this.state.parallaxProps}
        />

        <View style={styles.topVoteContainer}>
          <Image style={styles.topVote} source={TopVote} />
          <View style={styles.topVoteImg}>
            <Image source={{uri: this.state.item.topVote.img}}  resizeMode='cover' style={styles.topVoteImg} />
          </View>
          <Text style={styles.topVoteCount}>{this.state.item.topVote.vote}</Text>
        </View>

        <View style={styles.titleView}>
          <RankBackground width={width * 8} rank={this.state.item.rank} name={this.state.item.name} />
        </View>
      </TouchableOpacity>
    );
  }
}

export default class Home extends Component {
  constructor(props) {
    super();
    this.mounted = true;
    this.state = {
      navigation: props.navigation,
			card: null,
			topVote: null,
			showDetails: false,
			showVoteView: true,
			weeklyPollSelected: false,
			dailyPollSelected: false,
			loading: store.getState().data.loading,
			userInfo: store.getState().user.credentials,
			weeklyPoll: store.getState().data.poll.weekly,
			dailyPoll: store.getState().data.poll.daily,
			weeklyPollWaifus: store.getState().data.weeklyPollWaifus,
			dailyPollWaifus: store.getState().data.dailyPollWaifus,
			voteCount: 0,
      weeklyActiveIndex: 0,
      dailyActiveIndex: 0,
      size: { width, height },
    };

    this.selectWaifu = this.selectWaifu.bind(this)
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ ...newVal, weeklyPoll: newVal.poll.weekly, dailyPoll: newVal.poll.daily})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ userInfo: newVal.credentials })
    }))

    this.setState({
			userInfo: store.getState().user.credentials,
			weeklyPoll: store.getState().data.poll.weekly,
			dailyPoll: store.getState().data.poll.daily,
			weeklyPollWaifus: store.getState().data.weeklyPollWaifus,
      dailyPollWaifus: store.getState().data.dailyPollWaifus
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
    
    if(this.userUnsubscribe != null)
      this.userUnsubscribe()
  }

  componentDidMount(){
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
    this.mounted = false;
  }

  _onLayoutDidChange = e => {
    if(this.mounted){
      const layout = e.nativeEvent.layout;
      this.setState({ size: { width: layout.width, height: layout.height } });
    }
  };
  
  selectWaifu(item){
    // here handle carousel press
    var waifu = [this.state.weeklyPollWaifus, this.state.dailyPollWaifus].flat().filter(x => x.waifuId == item)[0]
    var poll = this.state.weeklyPollWaifus.map(x => x.waifuId).includes(item) ? this.state.weeklyPoll : this.state.dailyPoll;
    
    this.state.navigation.navigate("VoteDetails", {waifu, poll})
    this.setState({card: item})
  }
  
  _renderItem = ({item, index}, parallaxProps) => {
    return (
      //<WaifuImg item={item} parallaxProps={parallaxProps} onPress={this.selectWaifu} />
      <CarouselItem item={item} parallaxProps={parallaxProps} _onPressCarousel={this.selectWaifu}/>
    );
  }

  render(){
    return (
      <View style={{flex: 1, position:"relative"}}>
        
        {this.state.loading ?
          <></>
        :
          <Swiper
            index={0}
            horizontal={false}
            showsPagination={false}
            style={{backgroundColor:"rgba(0,0,0,1)"}}
          >
            <View style={{ flex: 1, position:"relative"}}>
              {this.state.weeklyPoll != null ?
                <View style={styles.countDown}>
                  <Countdown poll={this.state.weeklyPoll} type={"WEEKLY"}/>
                </View>
              :<></>}
  
              <View style={{ flex: 1, flexDirection:'row', alignItems:"center", justifyContent:"center" }}>
                <Carousel
                  data={this.state.weeklyPollWaifus.map(x => {
                    var topVote = {vote: "None", img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"};
                    var votes = _.orderBy(x.votes, ['vote'] ,['desc']);

                    if(this.state.weeklyPoll == null)
                      return {img: x.img, waifuId: x.waifuId, name: x.name, rank: x.rank, topVote }

                    if(votes.length > 0){
                      var maxVote = votes[0].vote;
                      if(votes.filter(x => x.vote == maxVote).length > 1){
                        //Theres A Tie
                        topVote.vote = "TIE";
                      }
                      else{
                        topVote = votes[0]
                      }
                    }

                    return {img: x.img, waifuId: x.waifuId, name: x.name, rank: x.rank, topVote }
                  })}
                  sliderWidth={this.state.size.width}
                  itemWidth={this.state.size.width * .8}
                  renderItem={this._renderItem}
                  hasParallaxImages={true}
                  loop
                  inactiveSlideScale={.85}
                  onSnapToItem = { index => this.setState({weeklyActiveIndex:index}) } />

                  <View style={{height:50, position:"absolute", bottom: 25, flex:1}}>
                    <Text style={{textAlign:"center", color:"white", fontSize:50, fontFamily:"Edo"}}>WEEKLY</Text>
                  </View>
              </View>
            </View>
            <View style={{ flex: 1, position:"relative"}}>
              {this.state.dailyPoll != null ?
                <View style={styles.countDown}>
                  <Countdown poll={this.state.dailyPoll} type={"DAILY"}/>
                </View>
              :<></>}
  
              <View style={{ flex: 1, flexDirection:'row', alignItems:"center", justifyContent:"center" }}>
                <Carousel
                  data={this.state.dailyPollWaifus.map(x => {
                    var topVote = {vote: "?", img: "https://images-na.ssl-images-amazon.com/images/I/51XYjrkAYuL._AC_SY450_.jpg"};
                    var votes = _.orderBy(x.votes, ['vote'], ['desc']);

                    if(this.state.dailyPoll == null)
                      return {img: x.img, waifuId: x.waifuId, name: x.name, rank: x.rank, topVote }

                    if(this.state.dailyPoll.isActive){
                      votes = votes.filter(x => x.husbandoId == this.state.userInfo.userId);
                      if(votes.length > 0){
                        topVote = votes[0]
                      }
                    }
                    else{
                      if(votes.length > 0){
                        var maxVote = votes[0].vote;
                        if(votes.filter(x => x.vote == maxVote).length > 1){
                          //Theres A Tie
                          topVote.vote = "TIE";
                        }
                        else{
                          topVote = votes[0]
                        }
                      }
                    }

                    return {img: x.img, waifuId: x.waifuId, name: x.name, rank: x.rank, topVote }
                  })}
                  sliderWidth={this.state.size.width}
                  itemWidth={this.state.size.width * .8}
                  renderItem={this._renderItem}
                  hasParallaxImages={true}
                  loop
                  enableSnap
                  inactiveSlideScale={.85}
                  onSnapToItem = { index => this.setState({dailyActiveIndex:index}) } />

                  <View style={{height:50, position:"absolute", bottom: 25, flex:1}}>
                    <Text style={{textAlign:"center", color:"white", fontSize:50, fontFamily:"Edo"}}>DAILY</Text>
                  </View>
              </View>
            </View>
          </Swiper>
        }
      </View>
    );
  }
}

Home.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor:"transparent"
  },
  countDown:{
    height: 80,
    width: width,
    position: "absolute",
    zIndex:1
  },
  item: {
    // width: width - 60,
    // height: width - 60,
    width: width * .8,
    height: height * .7,
    position: "relative",
    justifyContent:"center"
  },
  imageContainer: {
    flex: 1,
    // width: width * .8,
    // height: height * .6,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderColor: chroma('aqua').brighten().hex(),
    borderWidth: 2
  },
  titleView:{
    width: width * .8,
    position: "absolute",
    bottom: 0,
  },
  title:{
    color:"white",
    fontFamily: "Edo",
    fontSize: 30,
    textAlign: "center"
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain',
    flex: 1,
  },
  text: {
    color: "grey",
    fontSize: 30,
    fontWeight: "bold"
  },
  topVoteContainer: {
    width: width * .8,
    height: 200,
    justifyContent:"center",
    alignItems: "center",
    position:"absolute",
    bottom: 25,
    opacity: .85
  },
  topVote:{
    flex: 1,
    width: width * .8,
  },
  topVoteCount:{
    fontFamily: "Edo",
    fontSize: 50,
    alignSelf: "center",
    color: "red",
    position: "absolute",
    textAlign: "center",
    elevation: 10,
  },
  topVoteImg:{
    height: ( width * .8 ) / 4.5,
    width: ( width * .8 )  / 4.5,
    borderRadius: ((width + 100) /4.5)/2,
    position: "absolute",
    overflow: "hidden",

    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    backgroundColor : "#000"
  },
})