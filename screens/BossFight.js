import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, FAB, TouchableRipple, Card, Button } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import _ from 'lodash'
import Swiper from 'react-native-swiper'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import pointsIcon from '../assets/images/pointsIcon.png'
import submitSlotsIcon from '../assets/images/submitSlotIcon.png'
import rankCoinIcon from '../assets/images/rankCoinIcon.png'
import statCoinIcon from '../assets/images/statCoinIcon.png'
import bossDefeatedIcon from '../assets/images/bossDefeated.png'
import bossVSIcon from '../assets/images/bossVsIcon.png'
import bossHpIcon from '../assets/images/bossHpIcon.png'
import bossFightGif from '../assets/images/bossFight.gif'

//Redux
import store from '../redux/store';
import watch from 'redux-watch';
import { fightBoss } from '../redux/actions/dataActions';

import {
  LOADING_UI,
  STOP_LOADING_UI,
	SET_USER,
	SET_SNACKBAR
} from '../redux/types';

//Component
import RankBackground from '../components/RankBackGround'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

export default class BossFight extends Component {
  constructor(props) {
    super();
    this.mounted = true;
    
    var fights = _.cloneDeep(props.route.params.boss.fights);
    var userFightRec = fights.filter(x => x.husbandoId == store.getState().user.credentials.userId)

    this.state = {
      navigation: props.navigation,
      boss: props.route.params.boss,
			loading: store.getState().data.loading,
      userInfo: {...store.getState().user.credentials, waifus: _.orderBy(store.getState().user.waifus, ['rank'], ['desc']) },
      selectedWaifu: null,
      waifuRankColor: "",
      fightActive: false,
      fightCompleted: false,
      fightResult: 0,
      rewardResult: "",
      rolls: [],
      totalDmg: 0,
      userFightRec: _.isEmpty(userFightRec) ? null : userFightRec[0],
      size: { width, height },
    };

    this.selectWaifu = this.selectWaifu.bind(this)
    this.startBossFight = this.startBossFight.bind(this)
    this.handleSlideChange = this.handleSlideChange.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')
    
    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var boss = newVal.bosses.filter(x => x.bossId == this.state.boss.bossId)[0]
      var userFightRec = _.cloneDeep(boss.fights).filter(x => x.husbandoId == this.state.userInfo.userId);
      userFightRec = _.isEmpty(userFightRec) ? null : userFightRec[0];

      this.setState({ bosses: newVal.bosses, userFightRec })
    }))

    store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ userInfo: {...newVal.credentials, waifus: _.orderBy(newVal.waifus, ['rank'], ['desc']) }})
    }))

    var bosses = _.cloneDeep(store.getState().data.bosses);
    var boss = bosses.filter(x => x.bossId == this.state.boss.bossId)[0];
    var userFightRec = boss.fights.filter(x => x.husbandoId == this.state.userInfo.userId);
    userFightRec = _.isEmpty(userFightRec) ? null : userFightRec[0];

    this.setState({
      boss,
      userFightRec
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
    
    if(this.userUnsubscribe != null)
      this.userUnsubscribe()
  }
  
  checkBossReq(waifu){
    var boss = _.cloneDeep(this.state.boss);

    var canFight = true;
    var messages = null;

    boss.requirements.forEach(req => {
      Object.keys(req).forEach(type => {
        switch(type){
          case "rank":
            Object.keys(req[type]).forEach(x => {
              switch(x){
                case "equal":
                  if(req[type][x] == waifu.rank)
                    canFight = true;
                  else{
                    messages = { type: "Warning", message: "Waifu Rank Must Be " +req[type][x]  + " To Fight Boss" }
                  }
                  break;
                case "min":
                  if(req[type][x] <= waifu.rank)
                    canFight = true;
                  else{
                    messages = { type: "Warning", message: "Waifu Rank Too Low To Fight Boss (Min Rank - " + req[type][x]  + " )" }
                  }
                  break;
                case "max":
                  if(req[type][x] >= waifu.rank)
                    canFight = true;
                  else{
                    messages = { type: "Warning", message: "Waifu Rank Too High To Fight Boss (Max Rank - " + req[type][x]  + " )" }
                  }
                  break;
              }
            })
            break;
          case "originType":
            if(req[type].map(t => t.toLowerCase()).includes(waifu.type.toLowerCase()))
              canFight = true;
            else{
              messages = { type: "Warning", message: "Boss Will Only Fight " + req[type].join() + " Characters"}
            }
            break;
        }
      })
    })

    return {canFight, messages};
  }

  selectWaifu(waifu){
    if(this.state.userFightRec != null){
      if(this.state.userFightRec.defeated){
        store.dispatch({
          type: SET_SNACKBAR,
          payload: { type: "Warning", message: "You've already defeated this boss" }
        });
        return
      }

      if(this.state.userFightRec.waifusUsed.includes(waifu.waifuId)){
        store.dispatch({
          type: SET_SNACKBAR,
          payload: { type: "Warning", message: "Waifu Already Used To Fight This Boss" }
        });
        return
      }
    }
      
    var reqCheck = this.checkBossReq(waifu)
    if(reqCheck.messages != null){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: reqCheck.messages
      });
      return
    }
    
    var rankColor = ""
    switch(waifu.rank){
      case 1:
        rankColor = "#ff0000"
        break;
      case 2:
        rankColor = "#835220"
        break;
      case 3:
        rankColor = "#7b7979"
        break;
      case 4:
        rankColor = "#b29600"
        break;
    }
    this.setState({selectedWaifu: waifu, waifuRankColor: rankColor})
    this.handleSlideChange("next")
  }

  async startBossFight(){
    var bossFightObj = {
      waifuId: this.state.selectedWaifu.waifuId,
      bossId: this.state.boss.bossId
    }

    var result = await fightBoss(bossFightObj)

    this.handleSlideChange('next')
    this.setState({...result, fightCompleted: true})

    setTimeout(function(){
      store.dispatch({ type: SET_SNACKBAR, payload: {type: "info", message: result.rewardResult}})
    }, 1000)
  }
  
  handleSlideChange(slide){
    switch(slide){
      case "back":
        this.refs.swiper.scrollBy(-1)
        break;
      case "next":
        this.refs.swiper.scrollBy(1)
        break;
    }
  }

  _onLayoutDidChange = e => {
    if(this.mounted){
      const layout = e.nativeEvent.layout;
      this.setState({ size: { width: layout.width, height: layout.height } });
    }
  };

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

  render(){
    return (
      <>
        {this.state.loading ?
          <></>
        :
          <Swiper
            index={0}
            showsPagination={false}
            style={{backgroundColor:"rgba(0,0,0,1)"}}
            onLayout={this._onLayoutDidChange}
            scrollEnabled={false}
            loadMinimal
            ref='swiper'
          >
            <View style={styles.waifuListView}>
              <View style={{width: width, height: 50, backgroundColor: chroma('white'),  alignItems:"center", justifyContent:"center"}}>
                <Text style={styles.titleText}>WAIFUS</Text>
              </View>
              <FlatGrid
                itemDimension={150}
                items={this.state.userInfo.waifus}
                style={styles.gridView}
                spacing={20}
                renderItem={({item, index}) => {
                  var rankColor = ""
                  switch(item.rank){
                    case 1:
                      rankColor = "#ff0000"
                      break;
                    case 2:
                      rankColor = "#835220"
                      break;
                    case 3:
                      rankColor = "#7b7979"
                      break;
                    case 4:
                      rankColor = "#b29600"
                      break;
                  }

                  return(
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.selectWaifu(item)} style={styles.itemContainer}>
                      <View style={styles.statView}>
                        <View style={styles.statRow}>
                          <Image style={[styles.statImg, {tintColor: chroma(rankColor)}]} source={atkIcon} />
                          <Text style={[ styles.statsText, {color: chroma(rankColor).brighten()}]}>{item.attack}</Text>
                        </View>
                        <View style={styles.statRow}>
                          <Image style={[styles.statImg, {tintColor: chroma(rankColor)}]} source={defIcon} />
                          <Text style={[ styles.statsText, {color: chroma(rankColor).brighten()}]}>{item.defense}</Text>
                        </View>
                      </View>

                      <Image
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          resizeMode: "cover",
                          borderRadius: 10,
                          ...StyleSheet.absoluteFillObject,
                          
                        }}
                        source={{uri: item.img}}
                      />
                      <RankBackground rank={item.rank} name={item.name} />
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
              
            <View style={styles.container}>
              {this.state.selectedWaifu == null ?
                <></>
              :
                <>
                  <Image source={bossVSIcon} style={{height:150, width:150,
                    position: "absolute",
                    left: this.state.size.width/2 - 75,
                    top: (this.state.size.height/2) - 65,
                    zIndex: 5}}
                  />
                  
                  {/* Waifu Image */}
                  <MaskedView
                    style={{height: this.state.size.height, width: this.state.size.width, position: "absolute"}}
                    maskElement={
                      <View style={[styles.waifuMask, {borderRightWidth: this.state.size.width, borderTopWidth: this.state.size.height}]}/>
                    }
                  >
                    <ImageBackground blurRadius={1} style={[styles.imageContainer]}
                      imageStyle={{resizeMode:"cover"}} source={{uri: this.state.selectedWaifu.img}}>
                        
                      <LinearGradient
                        colors={[chroma(this.state.waifuRankColor).alpha(.5), chroma(this.state.waifuRankColor).alpha(.75), chroma(this.state.waifuRankColor)]}
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          zIndex:0,
                          justifyContent:"center", alignItems:"center"
                        }}
                      >
                        <View style={{height: '40%', width: '45%', position:"absolute", left:10, top: 10}}>
                          <ImageBackground style={[styles.imageContainer, {borderRadius: 10}]}
                            imageStyle={{resizeMode:"cover"}} source={{uri: this.state.selectedWaifu.img}}>
                            <>
                              <View style={[styles.statRow, {position:"absolute", left:10, top: 10}]}>
                                <Image style={[styles.statImg, {tintColor: 'white', height: 50, width:50}]} source={atkIcon} />
                                <Text style={[ styles.statsText, {color: 'white', fontSize: 50}]}>{this.state.selectedWaifu.attack}</Text>
                              </View>
                              <View style={[styles.statRow, {position:"absolute", left:10, top: 75}]}>
                                <Image style={[styles.statImg, {tintColor: 'white', height: 50, width:50}]} source={defIcon} />
                                <Text style={[ styles.statsText, {color: 'white', fontSize: 50}]}>{this.state.selectedWaifu.defense}</Text>
                              </View>
                            </>
                          </ImageBackground>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </MaskedView>

                  {/* Boss Image */}
                  <MaskedView
                    style={{height: this.state.size.height, width: this.state.size.width, position: "absolute", backgroundColor:"blue"}}
                    maskElement={
                      <View style={[styles.bossMask, {borderRightWidth: this.state.size.width, borderTopWidth: this.state.size.height}]}/>
                    }
                  >
                    <ImageBackground blurRadius={1} style={[styles.imageContainer]}
                      imageStyle={{resizeMode:"cover"}} source={{uri: this.state.boss.img}}>
                        
                      <LinearGradient
                        colors={['rgba(252,177,0,0.5)', 'rgba(255,149,0,0.75)', 'rgba(255,149,0,1)']}
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          zIndex:0,
                          justifyContent:"center", alignItems:"center"
                        }}
                      >
                        <View style={{height: '40%', width: '45%', position:"absolute", right:10, bottom: 10}}>
                          <ImageBackground style={[styles.imageContainer, {borderRadius: 10}]}
                            imageStyle={{resizeMode:"cover"}} source={{uri: this.state.boss.img}}>
                            <View style={[styles.statRow, {position:"absolute", zIndex:10, left:10, top: 10}]}>
                              <Image style={[styles.statImg, {tintColor: 'white', height: 50, width:50, tintColor: chroma('cyan').hex()}]} source={bossHpIcon} />
                              <Text style={[ styles.statsText, {color: 'white', fontSize: 50,
                                textShadowColor: chroma('cyan').hex(),
                                textShadowOffset: {width: -1, height: 1},
                                textShadowRadius: 10
                                }]}
                              >
                                {this.state.boss.hp}
                              </Text>
                            </View>
                          </ImageBackground>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </MaskedView>
                  
                  <View style={{height: 50, width: width * .4, position:"absolute", bottom: 5}}>
                    <Button
                      mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                      onPress={() => this.startBossFight()}
                    >Fight</Button>
                  </View>

                  <FAB
                    color="white"
                    style={styles.backFab}
                    icon="arrow-left-thick"
                    onPress={() => this.handleSlideChange("back")}
                  />
                </>
              }
            </View>
          
            <View style={[styles.container, {backgroundColor:"white"}]}>
              {
                !this.state.fightCompleted ? <></>
              :
                <View style={{flex: 1, width: width}}>
                  
                  <Image source={bossFightGif} resizeMode={"cover"} style={{...StyleSheet.absoluteFillObject, height: this.state.size.height, width: width, zIndex:5}}/>

                  {/* Rolls */}
                  <View style={{position:"absolute", zIndex:10, backgroundColor: chroma('black').alpha(.45), width: width, bottom: 0, left:0}}>
                    {/* <View style={{ height:50, flexDirection:"row", justifyContent:"center", alignSelf:"center"}}>
                      <View style={{flex:1, flexDirection:"row", alignItems:"flex-start", justifyContent:"flex-start"}}>
                        <Image style={[styles.statImg, {tintColor: 'white', height: 50, width:50, tintColor: chroma('cyan').hex()}]} source={defIcon} />
                        <Text style={[ styles.statsText, {color: 'white', fontSize: 35}]}>
                          {this.state.selectedWaifu.defense}
                        </Text>
                      </View>

                      <View style={{flex:1, flexDirection:"row", alignItems:"flex-start", justifyContent:"flex-start"}}>
                        <Image style={[styles.statImg, {tintColor: 'white', height: 50, width:50, tintColor: chroma('cyan').hex()}]} source={bossHpIcon} />
                        <Text style={[ styles.statsText, {color: 'white', fontSize: 35,
                          textShadowColor: chroma('cyan').hex(),
                          textShadowOffset: {width: -1, height: 1},
                          textShadowRadius: 10
                          }]}
                        >
                          {this.state.boss.hp}
                        </Text>
                      </View>
                    </View>*/}

                    <View style={{ height:45, flexDirection:"row", justifyContent:"center", alignSelf:"center"}}>
                      {this.state.rolls.map(roll => {
                        return(
                          <View style={{height:35, width:35, margin:5,
                            position:"relative", borderRadius: 5, backgroundColor:"black",
                            borderColor:"white", borderWidth: 1, alignItems:"center", justifyContent:"center"}}>
                            <View style={{width:35, position:"absolute", top:7}}>
                              <Text style={[ styles.statsText, {color: 'white', fontSize: 16, textAlign:"center"}]}>{roll}</Text>
                            </View>
                          </View>
                        )
                      })}
                    </View>
                    
                    <View style={{ flex:1, flexDirection:"row", justifyContent:"center", alignSelf:"center"}}>
                      <View style={{height:75, width:75, margin:5,
                        position:"relative", borderRadius: 10, backgroundColor:"black",
                        borderColor:"white", borderWidth: 1, alignItems:"center", justifyContent:"center"}}>
                        <View style={{width:75, position:"absolute", top:15}}>
                          <Text style={[ styles.statsText, {color: 'white', fontSize: 35, textAlign:"center"}]}>{this.state.totalDmg}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={{flex: 1, width: width, justifyContent:"center", alignSelf:"center"}}>
                    <Text
                      style={{
                        fontSize: 45,
                        color: 'black',
                        fontFamily: 'TarrgetLaser',
                        textShadowColor: chroma('cyan').hex(),
                        textShadowOffset: {width: -1, height: 1},
                        textShadowRadius: 10,
                        textAlign: "center"
                      }}
                    >
                      {
                        this.state.fightResult == 1 ? "VICTORY" :
                        this.state.fightResult == 2 ? "DEFEAT" :
                        this.state.fightResult == 3 ? "STALEMATE" : ""
                      }
                    </Text>
                  </View>
                      
                  <FAB
                    color="white"
                    style={styles.exitFab}
                    icon="close"
                    onPress={() => this.state.navigation.goBack()}
                  /> 
                </View>
              } 
            </View>
          </Swiper>
        }
      </>
    );
  }
}

BossFight.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center"
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10
  },
  waifuListView:{
    flex:1,
    width: width,
    backgroundColor: chroma('black').alpha(.75),
  },
  gridView: {
    flex: 1,
  },
  waifuMask: {
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightColor: 'white',
  },
  bossMask: {
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightColor: 'transparent',
    transform: [
      {rotate: '180deg'}
    ]
  },
  imageContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
    resizeMode:"cover"
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain',
    flex: 1,
  },
  titleText:{
    fontFamily: "Edo",
    fontSize: 35,
    textAlign: "center"
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
  statView:{
    flex:1, flexDirection: "row",
    backgroundColor: chroma('black').alpha(.45),
    position: "absolute", top: 0, zIndex: 2,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10
  },
  statRow:{
    flex:1,
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center"
  },
  statsText:{
    flex:1,
    fontFamily:"Edo",
    fontSize:25,
  },
  backFab: {
    position: 'absolute',
    margin: 8,
    left: 0,
    bottom: 30,
    backgroundColor: chroma('red').hex()
  },
  exitFab: {
    position: 'absolute',
    zIndex: 10,
    margin: 8,
    right: 0,
    top: 30,
    backgroundColor: chroma('red').hex()
  },
})