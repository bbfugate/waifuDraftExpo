import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar, Menu, Badge } from 'react-native-paper';
import Autocomplete from 'react-native-autocomplete-input';
import { FlatGrid } from 'react-native-super-grid';

import watch from "redux-watch";
import _, { replace } from "lodash";
import ls from 'lz-string';

import Swiper from 'react-native-swiper'
import { submitWaifu, toggleWishListWaifu } from '../redux/actions/dataActions'

// Redux stuff
import store from "../redux/store";
import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_SEARCH_DATA,
  SET_USER
} from '../redux/types';

const { width, height } = Dimensions.get('window');
const chroma = require('chroma-js')
const favoriteHeart = require('../assets/images/FavoriteHeart.png')

class CharThumbNail extends Component {
  constructor(props) {
    super(props);

    var char = props.char;
    var userInfo = props.userInfo;
    var waifuList = props.waifuList;
    var allUsers = props.allUsers;
    var selectedUser = props.selectedUser;

    var isSubmitted = waifuList.map(x => x.link).includes(char.link);
    if(isSubmitted)
      char = waifuList.filter(x => x.link == char.link)[0]

    this.selectCharacter = props.selectCharacter;
    this.state= {
      char,
      userInfo,
      waifuList,
      selectedUser,
      allUsers,
      openMenu: false,
      isSubmitted,
    }

    this.submitWaifu = this.submitWaifu.bind(this)
  }

  componentDidMount(){
    var char = this.state.char;
    if(this.state.isSubmitted)
      char = this.state.waifuList.filter(x => x.link == char.link)[0]

    var popRank = char.popRank ?? null;
    var husbando = null;
    var rankColor = chroma('black').alpha(.5)
    
    if(this.state.isSubmitted){
      switch(char.husbandoId){
        case "Weekly":
        case "Daily":
          break;
        case "Shop":
          break;
        default:
          husbando = this.state.allUsers.filter(x => x.userId == char.husbandoId)[0]
          break;
      }
  
      switch(char.rank){
        case 1:
          rankColor = chroma("#ff0000").alpha(.5)
          break;
        case 2:
          rankColor = chroma("#835220").alpha(.5)
          break;
        case 3:
          rankColor = chroma("#7b7979").alpha(.5)
          break;
        case 4:
          rankColor = chroma("#b29600").alpha(.5)
          break;
      }
    }

    this.setState({ char, popRank, husbando, rankColor })
  }

  componentWillReceiveProps(props){
    var char = props.char;
    var popRank = char.popRank ?? null;
    var husbando = null;
    var rankColor = chroma('black').alpha(.5)

    if(this.state.isSubmitted){
      char = props.waifuList.filter(x => x.link == char.link)[0]
      switch(char.husbandoId){
        case "Weekly":
        case "Daily":
          break;
        case "Shop":
          break;
        default:
          husbando = props.allUsers.filter(x => x.userId == char.husbandoId)[0]
          break;
      }
  
      switch(char.rank){
        case 1:
          rankColor = chroma("#ff0000").alpha(.5)
          break;
        case 2:
          rankColor = chroma("#835220").alpha(.5)
          break;
        case 3:
          rankColor = chroma("#7b7979").alpha(.5)
          break;
        case 4:
          rankColor = chroma("#b29600").alpha(.5)
          break;
      }
    }

    this.setState({ char, waifuList: props.waifuList, allUsers: props.allUsers, selectedUser: props.selectedUser,
      userInfo: props.userInfo, popRank, husbando, rankColor })
  }
  
  submitWaifu(){
    var char = _.cloneDeep(this.state.char)
    submitWaifu(char)
  }
  
  render(){
    var isFav = this.state.userInfo.wishList.includes(this.state.char.link);

    return(
      <View style={{flex:1, position:"relative", marginTop: 10}}>
        <Menu
          visible={this.state.openMenu}
          onDismiss={() => this.setState({openMenu: false})}
          anchor={
            <TouchableOpacity
              activeOpacity={.25}
              onPress={() => this.selectCharacter(this.state.char)}
              delayLongPress={100}
              onLongPress={() => this.setState({openMenu: true})}
              style={[styles.itemContainer]}
            >
              {
                this.state.husbando != null ?
                  <View style={[styles.profileImg, { position:"absolute", zIndex: 3, top: 5, right: 5 }]}>
                    <Image style={[styles.profileImg]} source={{uri: this.state.husbando.img}} />
                  </View>
                : <></>
              }

              {
                isFav ?
                  <View style={{ height:25, width: 25, position:"absolute", zIndex: 3, top: 5, left: 5 }}>
                    <Image style={{height:25, width: 25}} source={favoriteHeart} />
                  </View>
                : <></>
              }
              
              <Image
                style={{
                  flex: 1,
                  resizeMode: "cover",
                  borderRadius: 10,
                  ...StyleSheet.absoluteFillObject,
                }}
                source={{uri: this.state.char.img}}
              />
              
              <View style={{minHeight: 50, height: 'auto',  padding: 2, backgroundColor: this.state.rankColor, alignItems:"center", justifyContent:"center"}}>
                <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>
                  {this.state.char.name.length > 15 ? this.state.char.name.slice(0,15) + '...' : this.state.char.name}
                </Text>
              </View>
            </TouchableOpacity>
          }
        >
          <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => toggleWishListWaifu(this.state.char.link).then(() => setOpenMenu(false))} title={isFav ? "Remove Favorite" : "Add Favorite"} />

          {
            this.state.userInfo.submitSlots > 0  && !this.state.isSubmitted ?
              <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => this.submitWaifu()}
                title={"Submit"} />
            :<></>
          }
        </Menu>
      </View>
    )
  }
}

export default class UserWaifuFavorites extends Component {
  constructor(props) {
    super(props);

    var selectedUser = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }]
      .concat(store.getState().user.otherUsers).filter(x => x.userId == props.route.params.userId)[0];

    var allUsers = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);
    var searchItems = store.getState().data.searchItems;
    if(_.isEmpty(searchItems)){
      store.dispatch({type: LOADING_UI})

      var compressSearchJson = require('../assets/SearchFile.json');
      searchItems = JSON.parse(ls.decompress(compressSearchJson));
      store.dispatch({ type: SET_SEARCH_DATA, payload: searchItems });
      
	  	store.dispatch({type: STOP_LOADING_UI})
    }

    var chars = [];
    var wishList = selectedUser.wishList;
    if(wishList.length > 0){
      chars = chars.concat(searchItems.characters['Anime-Manga'].items);
      chars = chars.concat(searchItems.characters['Marvel'].items);
      chars = chars.concat(searchItems.characters['DC'].items);
    }

    this.state = {
      navigation: props.navigation,
      userInfo: store.getState().user.credentials,
      selectedUser,
      allUsers,
      chars,
      waifuList: store.getState().data.waifuList,
    };
    
    this.selectCharacter = this.selectCharacter.bind(this)

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ waifuList: newVal.waifuList })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var allUsers = newVal.otherUsers
      var selectedUser = newVal.otherUsers.concat(newVal.credentials)
        .filter(x => x.userId == this.state.selectedUser.userId)[0]

      this.setState({userInfo: newVal.credentials, allUsers, selectedUser})
    }))

    var selectedUser = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }]
      .concat(store.getState().user.otherUsers)
      .filter(x => x.userId == this.state.selectedUser.userId)[0]
    var allUsers = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers)
    this.setState({
      waifuList: store.getState().data.waifuList,
      userInfo: store.getState().user.credentials,
      selectedUser,
      allUsers
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

  selectCharacter(item){
    item.type = item.publisher ?? 'Anime-Manga';

    if(this.state.waifuList.map(x => x.link).includes(item.link)){
      if(item.husbandoId == this.state.userInfo.userId)
        this.state.navigation.navigate("CharDetails", {waifu: item})
      else
        this.state.navigation.navigate("OtherUserCharDetails", {waifu: item})
    }
    else{
      this.state.navigation.navigate("SubmitCharacter", {item})
    }
  }

  render() {
    var wishList = this.state.selectedUser.wishList;
    var chars = [];

    if(wishList.length > 0){
      chars = _.cloneDeep(this.state.chars).filter(x => wishList.includes(x.link));
      
      var replaceChars = chars.filter(x => this.state.waifuList.map(y => y.link).includes(x.link));
      chars = chars.filter(x => !replaceChars.map(y => y.link).includes(x.link))

      replaceChars = this.state.waifuList.filter(x => replaceChars.map(y => y.link).includes(x.link))
      chars = chars.concat(replaceChars)
      chars = _.sortBy(chars, ['popRank','desc']);
    }
    
    return (
      <>
        <View style={[styles.slideContainer,{backgroundColor: chroma('white').hex()}]}>
          <View style={{width: width, height: 50, backgroundColor: chroma('black').alpha(.15)}}>
            <Text style={styles.text}>WISHLIST</Text>
          </View>
          <View style={styles.slide}>
            <View style={styles.SeriesListView}>
              <FlatGrid
                itemDimension={100}
                items={chars}
                style={styles.gridView}
                spacing={10}
                renderItem={({item, index}) => 
                  <CharThumbNail waifuList={this.state.waifuList} selectedUser={this.state.selectedUser}
                    allUsers={this.state.allUsers} char={item} userInfo={this.state.userInfo} selectCharacter={this.selectCharacter} />
                }
              />
            </View>
          </View>
        </View>

        {/* <Searchbar
          placeholder="Search By Name"
          style={[styles.searchBar, {opacity: this.state.searchBarFocused ? 1 : .5}]}
          onBlur={() => this.setState({searchBarFocused: false})}
          onFocus={() => this.setState({searchBarFocused: true})}
          inputStyle={{fontFamily: "Edo", fontSize:15}}
          onChangeText={(text) => this.searchTextChange(text)}
          value={this.state.searchText}
        /> */}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"black"
  },
  text: {
    color: "black",
    fontFamily: "Edo",
    fontSize: 40,
    textAlign: "center",
    alignSelf: "center"
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  bgVideo:{
    position: "absolute",
    zIndex: 0
  },
  SeriesListView:{
    top: 0,
    bottom: 0,
    width: width,
    position:"absolute", zIndex: 1,
  },
  gridView: {
    flex: 1,
  },
  profileImg:{
    resizeMode: "cover",
    height: 45,
    width: 45,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 175,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 5
  },
  slideContainer:{
    flex:1,
    alignItems: "center",
    justifyContent: "center"
  },
  slide: {
    flex: 1,
    width: width,
    position: "relative"
  },
  searchBar:{
    width: width * .8,
    position: 'absolute',
    zIndex: 10,
    bottom: 12,
    fontFamily: "Edo",
    fontSize: 15
  },
  fab: {
    position: 'absolute',
    zIndex: 10,
    margin: 8,
    right: 0,
    bottom: 0
  },
})
