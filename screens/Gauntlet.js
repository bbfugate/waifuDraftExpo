import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { LinearGradient } from 'expo-linear-gradient';
import _ from 'lodash'
import Swiper from 'react-native-swiper'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import pointsIcon from '../assets/images/pointsIcon.png'
import rankCoinIcon from '../assets/images/rankCoinIcon.png'
import statCoinIcon from '../assets/images/statCoinIcon.png'
import bossDefeatedIcon from '../assets/images/bossDefeated.png'

import MarvelLogo from '../assets/images/MarvelLogo.png'
import DCLogo from '../assets/images/DCLogo.png'
import AnimeLogo from '../assets/images/AnimeLogo.png'

import shitTierBossIndi from '../assets/images/ShitTierBossIndi.gif'
import bronzeTierBossIndi from '../assets/images/BronzeTierBossIndi.gif'
import silverTierBossIndi from '../assets/images/SilverTierBossIndi.gif'
import goldTierBossIndi from '../assets/images/GoldTierBossIndi.gif'

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

//Component
import RankBackground from '../components/RankBackGround'
import Countdown from '../components/CountDown'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

export default class Gauntlet extends Component {
  constructor(props) {
    super();
    this.mounted = true;
    this.state = {
      navigation: props.navigation,
			loading: store.getState().data.loading,
      bosses: store.getState().data.bosses,
			userInfo: {...store.getState().user.credentials, waifus: _.orderBy(store.getState().user.waifus, ['rank'], ['desc']) },
      fightActive: false,
      fightCompleted: false,
      fightResult: 0,
      rolls: [],
      totalDmg: 0,
      userFightRec: null,
      showRules: false,
      size: { width, height },
    };

    this.selectBoss = this.selectBoss.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ bosses: newVal.bosses })
    }))

    store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ userInfo: {...newVal.credentials, waifus: _.orderBy(newVal.waifus, ['rank'], ['desc']) }})
    }))

    this.setState({
      bosses: store.getState().data.bosses,
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

  selectBoss(boss){
    this.state.navigation.navigate("BossFight", {boss})
  }

  _onLayoutDidChange = e => {
    if(this.mounted){
      const layout = e.nativeEvent.layout;
      this.setState({ size: { width: layout.width, height: layout.height } });
    }
  };

  render(){
    return (
      <>
        {this.state.loading ?
          <></>
        :
          <Swiper
            index={0}
            loop
            showsPagination={false}
            style={{backgroundColor:"rgba(0,0,0,1)"}}
          >
            {this.state.bosses.map(boss => {
              var fights = _.cloneDeep(boss.fights);
              var userFightRec = fights.filter(x => x.husbandoId == this.state.userInfo.userId)
              if(_.isEmpty(userFightRec))
                userFightRec = null
              else
                userFightRec = userFightRec[0]

              var indi = shitTierBossIndi;
              
              var bgColor = "#ff0000";
              switch(boss.tier){
                case 2:
                  bgColor = "#835220"
                  break;
                case 3:
                  bgColor = "#7b7979"
                  break;
                case 4:
                  bgColor = "#b29600"
                  break;
              }

              var minRank = shitTierBossIndi;
              var maxRank = goldTierBossIndi;
              var hasMinRankReq = false;
              var hasMaxRankReq = false;
              var hasAMReq = false;
              var hasDcReq = false;
              var hasMarvelReq = false;

              boss.requirements.forEach(req => {
                var key = Object.keys(req)[0];
                if(key == "rank"){
                  Object.keys(req[key]).forEach(x => {
                    if(x == "min"){
                      switch(req[key][x]){
                        case 2:
                          hasMinRankReq = true;
                          minRank = bronzeTierBossIndi
                          break;
                        case 3:
                          hasMinRankReq = true;
                          minRank = silverTierBossIndi
                          break;
                        case 4:
                          hasMinRankReq = true;
                          minRank = goldTierBossIndi
                          break;
                      }
                    }
                    else if(x == "max"){
                      switch(req[key][x]){
                        case 2:
                          hasMaxRankReq = true;
                          maxRank = bronzeTierBossIndi
                          break;
                        case 3:
                          hasMaxRankReq = true;
                          maxRank = silverTierBossIndi
                          break;
                        case 4:
                          hasMaxRankReq = true;
                          maxRank = goldTierBossIndi
                          break;
                      }
                    }
                  });
                }
                else{
                  if(req[key].includes("Anime-Manga"))
                    hasAMReq = true
                  if(req[key].includes("Marvel"))
                    hasMarvelReq = true
                  if(req[key].includes("DC"))
                    hasDcReq = true
                }
              })

              return (
                <View key={boss.name} onLayout={this._onLayoutDidChange}
                  style={{flex:1, justifyContent:"center", alignItems:"center"}}>

                  {userFightRec != null && userFightRec.defeated ?
                    <View style={[styles.bossDefeatedView]}>
                      <Image source={bossDefeatedIcon} style={{tintColor: "white", height: 300, width:300}} />
                    </View>
                  :<></>}

                  <TouchableOpacity onPress={() => this.selectBoss(boss)}
                    rippleColor="rgba(0, 0, 0, 1)"
                    style={{height: this.state.size.height * .9, width: width * .85}}
                  >
                    <ImageBackground blurRadius={.25} style={[styles.imageContainer]}
                      imageStyle={{resizeMode:"cover"}} source={{uri: boss.img}}>
                      <LinearGradient
                        colors={[chroma(bgColor).alpha(.25), chroma(bgColor).alpha(.5), chroma(bgColor).alpha(.75)]}
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          zIndex:0,
                          justifyContent:"center", alignItems:"center"
                        }}
                      >
                        <View style={{height: '100%', width: '100%'}}>
                      
                          <Countdown activeTill={boss.leaveTime.toDate()} type={"BOSS"} />
                          {/* <Image style={{position: 'absolute', top: '22%', right: 15, zIndex:2, height: 50, width: 50, resizeMode: "contain"}} source={indi}/> */}

                          <View style={{position: 'absolute', width: 'auto', top: '22%', right: 15, zIndex:2, flexDirection: "row"}}>
                            {/* {
                              hasMinRankReq ?
                              <View>
                                <Image style={{height: 50, width: 75, resizeMode: "contain"}} source={minRank}/>
                              </View>
                              :<></>
                            } */}
                            
                            <View>
                              <Image style={{height: 50, width: 50, resizeMode: "contain"}} source={maxRank}/>
                            </View>
                          </View>

                          <View style={{position: 'absolute', top: '22%', width: 'auto', left: 15, zIndex:2, flexDirection: "row"}}>
                            {
                              hasAMReq ?
                              <View>
                                <Image style={{height: 50, width: 75, resizeMode: "contain"}} source={AnimeLogo}/>
                              </View>
                              :<></>
                            }
                            {
                              hasMarvelReq ?
                                <View>
                                  <Image style={{height: 50, width: 50, resizeMode: "contain"}} source={MarvelLogo}/>
                                </View>
                              :<></>
                            }
                            {
                              hasDcReq ?
                              <View>
                                <Image style={{height: 50, width: 50, resizeMode: "contain"}} source={DCLogo}/>
                              </View>
                              :<></>
                            }
                          </View>

                          <Image style={{...StyleSheet.absoluteFillObject, top: '25%', left: '10%', height: '60%', width: '80%', resizeMode: "contain"}} source={{uri: boss.img}}/>
                        </View>
                      </LinearGradient>

                      <View style={{flex:1, width: width * .85, position:"absolute", bottom: 150 }}>
                        <Text style={[styles.text, {fontSize: 75, textAlign:"center"}]}>HP: {boss.hp}</Text>

                        {/* Points Section */}
                        <View style={{backgroundColor: chroma('black').alpha(.35)}}>
                          <View style={styles.pointsView}>
                            {boss.reward.points != null ?
                              <View style={styles.pointsReviewRow}>
                                <Image style={[styles.statImg, {tintColor: chroma("white")}]} source={pointsIcon} />
                                <Text style={[ styles.statsText, {color: chroma("white")}]}>{boss.reward.points}</Text>
                              </View>
                            :<></>}

                            {boss.reward.rankCoins != null ?
                              <View style={styles.pointsReviewRow}>
                                <Image style={[styles.statImg, {tintColor: chroma("white")}]} source={rankCoinIcon} />
                                <Text style={[ styles.statsText, {color: chroma("white")}]}>{boss.reward.rankCoins}</Text>
                              </View>
                            :<></>}

                            {boss.reward.statCoins != null ?
                              <View style={styles.pointsReviewRow}>
                                <Image style={[styles.statImg, {tintColor: chroma("white")}]} source={statCoinIcon} />
                                <Text style={[ styles.statsText, {color: chroma("white")}]}>{boss.reward.statCoins}</Text>
                              </View>
                            :<></>}
                          </View>
                        </View>
                      </View>

                      <View style={{flex:1, width: width * .85, position:"absolute", bottom: 25}}>
                        <Text style={[styles.text, {fontSize: 35, textAlign:"center"}]}>{boss.name}</Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              )
            })}
          </Swiper>
        }
      </>
    );
  }
}

Gauntlet.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bossDefeatedView:{
    ...StyleSheet.absoluteFillObject,
    zIndex:10,
    backgroundColor: chroma('black').alpha(.6),
    justifyContent: "center",
    alignItems: "center"
  },
  imageContainer: {
    flex: 1,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    resizeMode:"cover"
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain',
    flex: 1,
  },
  text: {
    fontFamily: "TarrgetLaser",
    color:"white",
    textShadowColor: chroma('cyan').hex(),
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  pointsView:{
    height:30, flexDirection: "row",
    justifyContent: "center", alignItems:"center",
    // position: "absolute", top: 0, zIndex: 2,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10
  },
  pointsReviewRow:{
    width:50,
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center"
  },
  pointsRow:{
    height: 35,
    flex:1,
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center"
  },
  statImg: {
    height: 25,
    width: 25,
  },
  statsText:{
    flex:1,
    fontFamily:"Edo",
    fontSize:25,
    marginLeft: 5
  },
})