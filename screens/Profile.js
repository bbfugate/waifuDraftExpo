import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, TouchableRipple, Card, Button } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import Swiper from 'react-native-swiper'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'

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

export default class Profile extends Component {
  constructor(props) {
    super();
    this.mounted = true;
    this.state = {
      navigation: props.navigation,
			loading: store.getState().data.loading,
      userInfo: store.getState().user.credentials,
      waifus: store.getState().user.waifus,
      size: {width,height}
    };

    this.selectWaifu = this.selectWaifu.bind(this)

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }
  
  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      // var trades = newVal.trades.filter(x => x.from.husbandoId == this.state.userInfo.userId || x.to.husbandoId == this.state.userInfo.userId);

      var userInfo = this.state.userInfo;
      userInfo.waifus = newVal.waifuList.filter(x => x.husbandoId == this.state.userInfo.userId);

      var selectedWaifu = null;
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

			this.setState({ userInfo, selectedWaifu})
			// this.setState({ trades, userInfo, selectedWaifu})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var selectedWaifu = null;
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifus.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

      this.setState({userInfo: newVal.credentials, waifus: newVal.waifus, selectedWaifu })
      // this.setState({userInfo: {...newVal.credentials, waifus: newVal.waifus }, selectedWaifu, users: newVal.otherUsers })
    }))
    
    this.setState({
      userInfo: store.getState().user.credentials,
      waifus: store.getState().user.waifus
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
  
  selectWaifu(waifu){
    this.state.navigation.navigate("CharDetails", {waifu})
  }

  render(){
    return (
      <>
        {this.state.loading ?
          <></>
        :
          <Swiper
            index={0}
            showsPagination={false}
          >
            {/* <View style={{ flex: 1, backgroundColor:"black"}}>
              <Text>LEFT</Text>
            </View> */}

            <View style={[styles.container]}>
              <View style={[styles.profileImg]} >
                <Image source={{uri: this.state.userInfo.img}} style={[styles.profileImg]} />
              </View>

              <View style={[styles.userInfoView]}>
                <View style={[styles.userInfo]}>
                  <Text style={[styles.text]}>{this.state.userInfo.userName}</Text>
                  <Text style={[styles.text]}>{this.state.userInfo.email}</Text>
                </View>
                
                <View style={[styles.userStatsView]}>
                  <Text style={[styles.text]}>Points - {this.state.userInfo.points}</Text>
                  <Text style={[styles.text]}>Rank Coins - {this.state.userInfo.rankCoins}</Text>
                  <Text style={[styles.text]}>Stat Coins - {this.state.userInfo.statCoins}</Text>
                  <Text style={[styles.text]}>Submit Slots - {this.state.userInfo.submitSlots}</Text>
                </View>
              </View>
            
              <View style={{height: 50, width: width}}>
                <Button
                  mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  onPress={logoutUser}
                >LogOut</Button>
              </View>
            </View>

            <View style={styles.waifuListView}>
              <FlatGrid
                itemDimension={150}
                items={this.state.waifus}
                style={styles.gridView}
                // staticDimension={300}
                // fixed
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
          </Swiper>
        }
      </>
    );
  }
}

Profile.navigationOptions = {
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
    elevation: 10
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
  }
})