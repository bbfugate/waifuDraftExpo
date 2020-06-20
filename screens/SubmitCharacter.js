import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import _ from 'lodash'
const chroma = require('chroma-js')

import Swiper from 'react-native-swiper'

import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'

import store from '../redux/store'
import watch from 'redux-watch'
import { submitWaifu } from '../redux/actions/dataActions'

const { width, height } = Dimensions.get('window');

export default class SubmitCharacter extends Component {
  constructor(props){
    super();
    this.state ={
      navigation: props.navigation,
      poll: store.getState().data.poll.weekly,
      waifuList: store.getState().data.waifuList,
      userInfo: store.getState().user.credentials,
      char: props.route.params.item,
    };
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({waifuList: newVal.waifuList, poll:newVal.poll.weekly})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.credentials})
    }))
    
    this.setState({
      userInfo: store.getState().user.credentials,
      poll: store.getState().data.poll.weekly,
      waifuList: store.getState().data.waifuList
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
  
  render(){
    return (
      <View style={[styles.container]}>
        <ImageBackground blurRadius={1} style={[styles.imageContainer]} imageStyle={{resizeMode:"cover"}} source={{uri: this.state.char.img}}>
          <ImageBackground style={[styles.imageContainer]} imageStyle={{resizeMode:"contain"}} source={{uri: this.state.char.img}}>
            <View style={styles.bgView}>
              <Swiper
                index={0}
                bounces
                removeClippedSubviews
                showsPagination={false}
              >
                <View style={styles.detailsView}>
                  {
                    this.state.userInfo.submitSlots > 0 && !this.state.poll.isActive && !this.state.waifuList.map(x => x.link).includes(this.state.char.link) ?
                      <View style={styles.buttonRowView}>
                        <View style={styles.buttonItem}>
                          <Button onPress={() => submitWaifu(this.state.char) } mode={"contained"} color={chroma('aqua').hex()} labelStyle={{height: 50, fontSize: 40, fontFamily: "Edo"}}>SUBMIT CHARACTER</Button>
                        </View>
                      </View>
                    : <></>
                  }
                </View>
              
                {/* Details */}
                <View style={styles.detailsView}>
                  {this.state.char.type == "Anime-Manga" ? <AMCharDetails card={this.state.char}/> : <ComicCharDetails card={this.state.char} />}
                </View>
              </Swiper>
            </View>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}

SubmitCharacter.navigationOptions = {
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
    position:"absolute",
    bottom: 10,
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
    bottom: 4,
    backgroundColor: chroma('aqua').hex()
  },
});
