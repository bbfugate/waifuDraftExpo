import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, FAB, TouchableRipple, Card, Button } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import Swiper from 'react-native-swiper'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
const favoriteHeart = require('../assets/images/FavoriteHeart.png')

//Redux
import store from '../redux/store';
import watch from 'redux-watch'
import { useSelector } from 'react-redux';
import { logoutUser } from '../redux/actions/userActions'

//Component
import Countdown from '../components/CountDown'
import RankBackground from '../components/RankBackGround'

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

function Row({ item, index }) {
  return(
    <View style={{flex: 1, height: 200, justifyContent:"center", alignItems:"center"}}>
      <ImageBackground resizeMode={"cover"} style={{flex:1}} source={{uri: item.img}}>
        <Text style={[styles.text, {fontSize: 15}]}>{item.name}</Text>
      </ImageBackground>
    </View>
  )
}

export default class OtherUserProfile extends Component {
  constructor(props) {
    super();
    this.mounted = true;

    var waifuList = store.getState().data.waifuList;
    var trades = _.cloneDeep(store.getState().data.trades);
    trades = trades.filter(x => x.from.husbandoId == props.route.params.otherUser.userId || x.to.husbandoId == props.route.params.otherUser.userId)
      
    this.state = {
      navigation: props.navigation,
      otherUser: props.route.params.otherUser,
      waifuList: waifuList,
			loading: store.getState().data.loading,
      userInfo: {...store.getState().user.credentials, waifus: store.getState().user.waifus},
      users: [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers),
      trades: trades,
      size: {width,height}
    };

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)

    this.startChat = this.startChat.bind(this)
    this.startTrade = this.startTrade.bind(this)
    this.selectTrade = this.selectTrade.bind(this)
    this.selectWaifu = this.selectWaifu.bind(this)
    this.openUserFavoritesScreen = this.openUserFavoritesScreen.bind(this)
  }
  
  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var trades = _.cloneDeep(newVal.trades);
      trades = trades.filter(x => x.from.husbandoId == this.state.otherUser.userId || x.to.husbandoId == this.state.otherUser.userId)

			this.setState({ trades, waifuList: newVal.waifuList })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var otherUser = newVal.otherUsers.filter(x => x.userId == this.state.otherUser.userId)[0];
      var users = [{...newVal.credentials, waifus: newVal.waifus }].concat(newVal.otherUsers);

      this.setState({otherUser, userInfo: {...newVal.credentials, waifus: newVal.waifus}, users })
    }))
    
    var trades = _.cloneDeep(store.getState().data.trades);
    trades = trades.filter(x => x.from.husbandoId == this.state.otherUser.userId || x.to.husbandoId == this.state.otherUser.userId)
    var users = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);

    this.setState({
      userInfo: {...store.getState().user.credentials, waifus: store.getState().user.waifus},
      otherUser: store.getState().user.otherUsers.filter(x => x.userId == this.state.otherUser.userId)[0],
      trades,
      users,
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
    this.mounted = false;
  }
  
  startTrade(){
    this.state.navigation.navigate("NewTrade",  {otherUser: this.state.otherUser})
  }

  selectTrade(trade){
    this.state.navigation.navigate("ViewTrade", {trade})
  }
  
  selectWaifu(waifu){
    this.state.navigation.navigate("OtherUserCharDetails", {waifu})
  }
  
  openUserFavoritesScreen(){
    var userId = this.state.otherUser.userId
    this.state.navigation.navigate("UserWaifuFavorites", {userId})
  }

  startChat(){
    var chats = _.cloneDeep(store.getState().chat.chats);
    var existChat = chats.filter(x => x.chatName == undefined && x.users.includes(this.state.otherUser.userId))

    if(_.isEmpty(existChat)){
      var chat = {
        users: [this.state.otherUser.userId, this.state.userInfo.userId],
        muted: [],
        createdBy: this.state.userInfo.userId,
      }
  
      this.state.navigation.navigate("ViewChat", {chat})
    }
    else{
      existChat = existChat[0];
      this.state.navigation.navigate("ViewChat", {chat: existChat})
    }
  }

  render(){
    var waifus = _.cloneDeep(this.state.waifuList).filter(x => this.state.otherUser.waifus.includes(x.waifuId));
    var waifuGroups = _.chain(waifus)
    .groupBy(waifu => Number(waifu.rank))
    .map((waifus, rank) => ({ rank: Number(rank), waifus }))
    .orderBy(group => Number(group.rank), ['desc'])
    .value()

    waifus = waifuGroups.flatMap(x => x.waifus)

    return (
      <>
        {this.state.loading ?
          <></>
        :
          <View style={{flex:1}}>
            <Swiper
              index={0}
              showsPagination={false}
              style={{backgroundColor: "white"}}
            >
              <View style={[styles.container]}>
                <View style={[styles.profileImg]} >
                  <Image source={{uri: this.state.otherUser.img}} style={[styles.profileImg]} />
                </View>

                <View style={[styles.userInfoView]}>
                  <View style={[styles.userInfo]}>
                    <Text style={[styles.text]}>{this.state.otherUser.userName}</Text>
                  </View>
                  
                  <View style={[styles.userStatsView]}>
                    <Text style={[styles.text]}>Points - {this.state.otherUser.points}</Text>
                    <Text style={[styles.text]}>Rank Coins - {this.state.otherUser.rankCoins}</Text>
                    <Text style={[styles.text]}>Stat Coins - {this.state.otherUser.statCoins}</Text>
                    <Text style={[styles.text]}>Submit Slots - {this.state.otherUser.submitSlots}</Text>
                  </View>
                </View>
              
                <View style={{height: 50, width: width * .8}}>
                  <Button
                    mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    onPress={this.startTrade}
                  >Start Trade</Button>
                </View>
              
                <FAB
                  //small
                  color="white"
                  style={styles.fab}
                  icon="message-text-outline"
                  onPress={this.startChat}
                />
              </View>
            
              <View style={styles.waifuListView}>
                <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
                  <Text style={styles.text}>TRADES</Text>
                </View>
                <FlatGrid
                  itemDimension={200}
                  items={_.cloneDeep(this.state.trades.filter(x => x.status == "Active")).concat(_.cloneDeep(this.state.trades.filter(x => x.status != "Active")))}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    const users = this.state.users;
                    const fromUser = users.filter(x => x.userId == item.from.husbandoId)[0];
                    const toUser = users.filter(x => x.userId == item.to.husbandoId)[0];

                    return(
                      <TouchableOpacity activeOpacity={.25}
                        onPress={() => this.selectTrade(item)} 
                        style={[styles.itemContainer, {backgroundColor: index % 2 ? chroma('white').alpha(.75) : chroma('black').alpha(.75)}]}
                      >
                        
                        {
                          item.status != "Active" ?
                          <View style={{...StyleSheet.absoluteFillObject, zIndex: 20, elevation: 15, justifyContent:"center", alignItems:"center"}}>
                            <Text style={[styles.text, 
                            {
                              fontSize:50, 
                              color: item.status == "Accepted" ? chroma("green").brighten() :
                                chroma('red').brighten()
                            }]}>{item.status}</Text>
                          </View>
                          : <></>
                        }

                        <View style={{flexDirection:"row", backgroundColor: chroma('white')}}>
                          <View style={{flex: 1}}>
                            <Text style={[styles.text]}>From</Text>
                          </View>
                          <View style={{flex: 1}}>
                            <Text style={[styles.text]}>To</Text>
                          </View>
                        </View>
                        <View style={{flex: 1, flexDirection:"row"}}>
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <View style={[styles.tradeUserImg]}>
                              <Image source={{uri: fromUser.img}} style={[styles.tradeUserImg]} />
                            </View>
                          </View>
                          
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <View style={[styles.tradeUserImg]}>
                              <Image source={{uri: toUser.img}} style={[styles.tradeUserImg]} />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                />
              </View>
            
              <View style={styles.waifuListView}>
                <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
                  <Text style={styles.text}>WAIFUS</Text>
                </View>
                <FlatGrid
                  itemDimension={150}
                  items={waifus}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    var isFav = this.state.userInfo.wishList.includes(item.link)
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
                        {
                          isFav ?
                            <View style={{ height:25, width: 25, position:"absolute", zIndex: 3, top: 5, right: 5 }}>
                              <Image style={{height:25, width: 25}} source={favoriteHeart} />
                            </View>
                          : <></>
                        }

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
                
                <FAB
                  small
                  color="white"
                  style={styles.favFab}
                  icon="heart-box"
                  onPress={() => this.openUserFavoritesScreen()}
                />
              </View>
            </Swiper>
          </View>
        }
      </>
    );
  }
}

OtherUserProfile.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems:"center",
    justifyContent: "center",
    backgroundColor: chroma('white').alpha(.75),
  },
  profileImg:{
    height: width/2.25,
    width: width/2.25,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: width/2,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
  },
  tradeUserImg:{
    height: width/3,
    width: width/3,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: width/3,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
  },
  userInfoView:{
    flex: 1,
    width: width,
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    width: width,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 1,
    backgroundColor: chroma('white').alpha(.85),
    alignItems:"center",
    justifyContent:"center"
  },
  userStatsView:{
    flex: 3,
    padding: 10,
    width: width,
    backgroundColor: chroma('black').alpha(.025),
  },
  text:{
    fontFamily: "Edo",
    fontSize: 35,
    textAlign: "center"
  },
  titleView:{
    flex: 1,
    position: "absolute",
    bottom: 0,
  },
  waifuListView:{
    flex:1,
    width: width,
    backgroundColor: chroma('black').alpha(.75),
  },
  gridView: {
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 5
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
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    top: 0,
    backgroundColor: chroma('aqua').hex()
  },
  favFab: {
    position: 'absolute',
    zIndex: 10,
    margin: 5,
    right: 0,
    top: 0
  }
})