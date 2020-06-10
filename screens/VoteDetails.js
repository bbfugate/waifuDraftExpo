import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import _ from 'lodash'
const chroma = require('chroma-js')

import Swiper from 'react-native-swiper'
import NumericInput from 'react-native-numeric-input'

import TopVote from '../assets/images/TopVote.png'
import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import {submitVote} from '../redux/actions/dataActions'

import store from '../redux/store'
import watch from 'redux-watch'

const { width, height } = Dimensions.get('window');

function VoteRow({ vote }) {
  return (
    <View style={styles.voteRow}>
      <View style={{flex: 2}}>
        <View style={styles.voteRowImg}>
          <Image source={{uri: vote.img}}  resizeMode='cover' style={styles.voteRowImg} />
        </View>
      </View>
      <Text style={styles.voteRowText}>{vote.husbando}</Text>
      <Text style={styles.voteRowVoteCount}>{vote.vote}</Text>
    </View>
  );
}

export default class VoteDetails extends Component {
  constructor(props){
    super();
    this.state ={
      navigation: props.navigation,
      poll: props.route.params.poll,
      pollType: props.route.params.poll.firstVote != null ? "weekly" : "daily",
      waifu: props.route.params.waifu,
      userInfo: store.getState().user.credentials,
      topVote: {vote: "None", img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"},
      voteCount: 0
    };
    
    this.submitVote = this.submitVote.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var newWaifu = [newVal.weeklyPollWaifus, newVal.dailyPollWaifus].flat().filter(x => x.waifuId == this.state.waifu.waifuId)[0]
      var newPoll = this.state.pollType == "weekly" ? newVal.poll.weekly : newVal.poll.daily;

      var topVote = {vote: "None", img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"};
      var votes = _.orderBy(newWaifu.votes, ['vote'] ,['desc']);
      if(this.state.pollType == "daily" && newPoll.isActive){
        votes = votes.filter(x => x.husbandoId == this.state.userInfo.userId);
        if(votes.length > 0){
          topVote = votes[0]
        }
        votes = [];
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

      this.setState({waifu:newWaifu, poll:newPoll, topVote})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.credentials})
    }))

    
    var updtUserInfo = store.getState().user.credentials;
    var updtWaifu = [store.getState().data.weeklyPollWaifus, store.getState().data.dailyPollWaifus].flat().filter(x => x.waifuId == this.state.waifu.waifuId)[0]
    var updtPoll = this.state.pollType == "weekly" ? store.getState().data.poll.weekly : store.getState().data.poll.daily;

    var topVote = {vote: "None", img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"};
    var votes = _.orderBy(updtWaifu.votes, ['vote'] ,['desc']);
    if(this.state.pollType == "daily" && updtPoll.isActive){
      votes = votes.filter(x => x.husbandoId == updtUserInfo.userId);
      if(votes.length > 0){
        topVote = votes[0]
      }
      votes = [];
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

    this.setState({
      userInfo: updtUserInfo,
      poll: updtPoll,
      waifu: updtWaifu,
      topVote
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
    
    if(this.userUnsubscribe != null)
      this.userUnsubscribe()
  }
  
  componentDidMount(){
    var topVote = _.cloneDeep(this.state.topVote);
    var votes = _.orderBy(this.state.waifu.votes, ['vote'] ,['desc']);

		if(this.state.pollType == "daily" && this.state.poll.isActive){
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
    
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());

    this.setState({topVote})
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
  }

  submitVote(vote, waifu){
    console.log(vote)
    console.log(waifu)

    submitVote(vote, waifu)
    this.setState({voteCount: 0})
  }

  _onMomentumScrollEnd = (e, state, context) => {
  }

  waifuLinkPress = async () => {
    WebBrowser.openBrowserAsync(this.state.waifu.link);
  };
  
  render(){
    return (
      <View style={[styles.container]}>
        <ImageBackground blurRadius={.45} style={[styles.imageContainer]} source={{uri: this.state.waifu.img}}>
          <View style={styles.bgView}>
            <Swiper
              index={0}
              showsPagination={false}
              onMomentumScrollEnd = {this._onMomentumScrollEnd}
              removeClippedSubviews
              bounces
            >
              {/* Vote List */}
              <View style={{flex:1}}>
                <View style={styles.topVoteContainer}>
                  <Image style={styles.topVote} source={TopVote} />
                  <View style={styles.topVoteImg}>
                    <Image source={{uri: this.state.topVote.img}}  resizeMode='cover' style={styles.topVoteImg} />
                  </View>
                  <Text style={styles.topVoteCount}>{this.state.topVote.vote}</Text>
                </View>

                <View style={[styles.voteView]}>
                  <FlatList
                    data={this.state.pollType == "daily" && this.state.poll.isActive ? [] : _.orderBy(this.state.waifu.votes, ['vote'], ['desc'])}
                    renderItem={({ item }) => <VoteRow vote={item} />}
                    keyExtractor={item => item.husbandoId}
                  />
                  
                  {
                    this.state.poll.isActive && this.state.userInfo.points > 0 ?
                      <View style={{height: 50, flexDirection: "row" , alignItems:"center", justifyContent:"center"}}>
                        <View style={{flex: 1, alignItems:"center", justifyContent:"center"}}>
                          <NumericInput value={this.state.voteCount} 
                            onChange={value => this.setState({voteCount: value})}
                            rounded
                            minValue={0} 
                            maxValue={this.state.userInfo.points}
                            totalHeight={35}
                            leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                            rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                            separatorWidth={0}
                            inputStyle={{ 
                              fontFamily:"Edo",
                              fontSize: 25,
                            }}
                            containerStyle={{ 
                              flex:.6,
                              width: width/2.25,
                              backgroundColor: chroma('white').alpha(.5).hex(),
                              borderWidth: 1,
                              borderColor: chroma('black').alpha(.25).hex(),
                             }}
                          />
                        </View>
                        <View style={{flex: 1, alignItems:"center", justifyContent:"center"}}>
                          <Button disabled={this.state.voteCount == 0}
                            mode="contained"
                            color={chroma('aqua').hex()}
                            style={{ fontFamily:"Edo", flex: .75, width: width/2.5 }}
                            onPress={() => this.submitVote(this.state.voteCount, this.state.waifu)}
                          >Submit Vote</Button>
                        </View>
                      </View>
                    :<></>
                  }
                </View>
              </View>
            
              {/* Details */}
              <View style={styles.detailsView}>
                {this.state.waifu.type == "Anime-Manga" ? <AMCharDetails card={this.state.waifu}/> : <ComicCharDetails card={this.state.waifu} />}
              </View>
            </Swiper>
          </View>
        </ImageBackground>
        
        <FAB
          //small
          color="white"
          style={styles.fab}
          icon="link-variant"
          onPress={this.waifuLinkPress}
        />
      </View>
    );
  }
}

VoteDetails.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  bgView:{
    flex: 1,
    backgroundColor: "rgba(255,255,255,.25)"
  },
  imageContainer: {
    flex: 1,
  },
  topVoteContainer: {
    width: width,
    height: 250,
    justifyContent:"center",
    alignItems: "center",
    position:"relative"
  },
  topVote:{
    flex:1,
    width: width + 75,
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
    height: (width + 100) / 4.5,
    width: (width + 100)  / 4.5,
    borderRadius: ((width + 100) /4.5)/2,
    position: "absolute",
    overflow: "hidden",

    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    backgroundColor : "#000"
  },
  voteView: {
    flex:1,
    width: width,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor:"rgba(255,255,255,.5)",
    justifyContent: "center",
    alignItems:"center"
  },
  voteRow: {
    height: 150,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    flexDirection:"row",
    borderBottomColor: "black",
    borderBottomWidth: 1
  },
  voteRowImg:{
    alignSelf: "center",
    height: (width) / 4.5,
    width: (width)  / 4.5,
    borderRadius: ((width + 100) /4.5)/2,
    overflow: "hidden",
    shadowOffset: { width: 10, height: 10 },
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    backgroundColor : "#000"
  },
  voteRowText: {
    flex: 2,
    fontFamily: "Edo",
    fontSize: 30,
  },
  voteRowVoteCount:{
    flex: 1,
    fontFamily: "Edo",
    fontSize: 30,
  },
  detailsView:{
    flex: 1,
  },
	voteText:{
    position: 'absolute',
		bottom: 8
	},
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    top: 0,
    backgroundColor: chroma('aqua').hex()
  },
});
