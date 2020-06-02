import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, TouchableHighlight,
   Image, ImageBackground, Dimensions, FlatList, Modal } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import _ from 'lodash'
const chroma = require('chroma-js')

import Swiper from 'react-native-swiper'
import NumericInput from 'react-native-numeric-input'

import TopVote from '../assets/images/TopVote.png'
import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import {useRankCoin, useStatCoin} from '../redux/actions/dataActions'

import store from '../redux/store'
import watch from 'redux-watch'

const { width, height } = Dimensions.get('window');

export default class CharDetails extends Component {
  constructor(props){
    super();
    this.state ={
      navigation: props.navigation,
      poll: store.getState().data.poll.weekly,
      userInfo: store.getState().user.credentials,
      waifu: props.route.params.waifu,
      showRankCoinConf: false,
    };
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
    this.useRankCoinFunc = this.useRankCoinFunc.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var newWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
      this.setState({waifu:newWaifu, poll:newVal.poll.weekly})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.credentials})
    }))
    
    this.setState({
      userInfo: store.getState().user.credentials,
      poll: store.getState().data.poll.weekly,
      waifu: store.getState().user.waifus.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
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
  }

  waifuLinkPress = async () => {
    WebBrowser.openBrowserAsync(this.state.waifu.link);
  };

  useRankCoinFunc(){
    useRankCoin(this.state.waifu)
    this.setState({ showRankCoinConf: false})
  }

  render(){
    return (
      <View style={[styles.container]}>
        <ImageBackground blurRadius={1} style={[styles.imageContainer]} imageStyle={{resizeMode:"cover"}} source={{uri: this.state.waifu.img}}>
          <ImageBackground style={[styles.imageContainer]} imageStyle={{resizeMode:"contain"}} source={{uri: this.state.waifu.img}}>
            <View style={styles.bgView}>
              <Swiper
                index={0}
                bounces
                removeClippedSubviews
                showsPagination={false}
              >
                {/* Stats List */}
                <View style={{flex:1}}>

                  <View style={styles.statsView}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>ATK: {this.state.waifu.attack}</Text>
                      <Text style={styles.statText}>DEF: {this.state.waifu.defense}</Text>
                    </View>
                  </View>
                  <View style={styles.buttonRowView}>
                    <View style={styles.buttonItem}>
                      <Button onPress={() => this.setState({showRankCoinConf: true})}
                        disabled={this.state.userInfo.rankCoins <= 0 || this.state.waifu.rank >= 4}
                        mode={"contained"} color={chroma('aqua').hex()} 
                        labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                      >
                        Use Rank Coin
                      </Button>
                    </View>

                    <View style={styles.buttonItem}>
                      <Button disabled={true} mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}>Use Stat Coin</Button>
                    </View>
                  </View>
                </View>
              
                {/* Details */}
                <View style={styles.detailsView}>
                  {this.state.waifu.type == "Anime-Manga" ? <AMCharDetails card={this.state.waifu}/> : <ComicCharDetails card={this.state.waifu} />}
                </View>
              </Swiper>
            </View>
          </ImageBackground>
        </ImageBackground>

        <FAB
          //small
          color="white"
          style={styles.fab}
          icon="link-variant"
          onPress={this.waifuLinkPress}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showRankCoinConf}
          onRequestClose={() => this.setState({showRankCoinConf: false})}
        >
          <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
            <View style={{height: 150, width: width, backgroundColor: chroma("white"),
              borderRadius: 25}}>
              
              <View style={{flex:1}}>
                <Text style={styles.text}>You Are About To Use A Rank Coin. Proceed?</Text>
              </View>

              <View style={styles.buttonRowView}>
                <View style={styles.buttonItem}>
                  <Button onPress={this.useRankCoinFunc}
                    mode={"contained"} color={chroma('aqua').hex()} 
                    labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  >
                    Confirm
                  </Button>
                </View>

                <View style={styles.buttonItem}>
                  <Button mode={"contained"}
                    onPress={() => this.setState({showRankCoinConf: false})}
                    color={chroma('aqua').hex()}
                    labelStyle={{fontSize: 20, fontFamily: "Edo"}}>
                      Cancel
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

CharDetails.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bgView:{
    flex: 1,
    backgroundColor: "rgba(255,255,255,.25)"
  },
  imageContainer: {
    flex: 1,
  },
  buttonRowView: {
    height: 75,
    width: width,
    flexDirection: "row",
  },
  buttonItem:{
    flex: 1,
    padding: 8,
    alignSelf:"center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
  },
  text:{
    fontFamily: "Edo",
    fontSize: 30,
    textAlign: "center"
  },
  detailsView:{
    flex: 1,
  },
  statsView:{
    flex: 1,
    width: width,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  statsRow: {
    width: width,
    backgroundColor: chroma('black').alpha(.3),
    position: "absolute",
    bottom: 0,
  },
	statText:{
    fontSize: 65,
    fontFamily: "TarrgetLaser",
    textAlign: "center",
    color: "white",
    textShadowColor: chroma('aqua').brighten().hex(),
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
	},
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    top: 0,
    backgroundColor: chroma('aqua').hex()
  },
});
