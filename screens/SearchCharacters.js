import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar, Menu } from 'react-native-paper';
import Autocomplete from 'react-native-autocomplete-input';
import { FlatGrid } from 'react-native-super-grid';

import watch from "redux-watch";
import _ from "lodash";

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

function CharThumbNail(props){
  const selectCharacter = props.selectCharacter;
  const [openMenu, setOpenMenu] = React.useState(false);

  var char = props.char;
  const userInfo = props.userInfo;
  const waifuList = props.waifuList;
  const users = props.users;

  const isFav = userInfo.wishList.includes(char.link);
  const isSubmitted = waifuList.map(x => x.link).includes(char.link);
  if(isSubmitted)
    char = waifuList.filter(x => x.link == char.link)[0]
    
  var popRank = char.popRank ?? null;
  var husbando = null;
  var rankColor = chroma('black').alpha(.5)
  switch(char.husbandoId){
    case "Weekly":
    case "Daily":
      break;
    case "Shop":
      break;
    default:
      husbando = users.filter(x => x.userId == char.husbandoId)[0]
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

  return(
    <View style={{flex:1, position:"relative", marginTop: 10}}>
      <Menu
        visible={openMenu}
        onDismiss={() => setOpenMenu(false)}
        anchor={
          <TouchableOpacity
            activeOpacity={.25}
            onPress={() => selectCharacter(char)}
            delayLongPress={500}
            onLongPress={() => setOpenMenu(true)}
            style={[styles.itemContainer]}
          >
            {
              husbando != null ?
                <View style={[styles.profileImg, { position:"absolute", zIndex: 3, top: 5, right: 5 }]}>
                  <Image style={[styles.profileImg]} source={{uri: husbando.img}} />
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
              source={{uri: char.img}}
            />
            
            <View style={{minHeight: 50, height: 'auto',  padding: 2, backgroundColor: rankColor, alignItems:"center", justifyContent:"center"}}>
              <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>
                {char.name.length > 15 ? char.name.slice(0,15) + '...' : char.name}
              </Text>
            </View>
          </TouchableOpacity>
        }
      >
        <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => toggleWishListWaifu(char.link)} title={isFav ? "Remove From WishList" : "Add To WishList"} />

        {/* {
          userInfo.submitSlots > 0  && !isSubmitted ?
            <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => submitWaifu(char)}
              title={"Submit"} />
          :<></>
        } */}
      </Menu>
    </View>
  )
}

export default class SearchCharacters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      navigation: props.navigation,
      type: props.route.params.type,
      origChars: props.route.params.chars,
      chars: _.cloneDeep(props.route.params.chars),
      userInfo: store.getState().user.credentials,
      users : [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers),
      waifuList: store.getState().data.waifuList,
      searchText: "",
      searchBarFocused: false,
    };

    this.searchTextChange = this.searchTextChange.bind(this);
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
      this.setState({userInfo: newVal.credentials})
    }))

    this.setState({
      waifuList: store.getState().data.waifuList,
      userInfo: store.getState().user.credentials,
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

  searchTextChange(text){
    var items = _.cloneDeep(this.state.origChars);

    switch(this.state.type){
      case 'Anime-Manga':
        items = _.filter(items,function(item){
          return item.name.toLowerCase().includes(text.toLowerCase());
        });
        break;
      case 'Marvel':
      case 'DC':
        //check realnames, and aliases
        items = _.filter(items, function(item) {
          if(item.name.toLowerCase().includes(text.toLowerCase()) ||
            item.currentAlias.toLowerCase().includes(text.toLowerCase()) || 
            _.includes(item.realName.map(x => x.toLowerCase()), text) ||
            _.includes(item.aliases.map(x => x.toLowerCase()), text)) //check other alias name list
            return true
        });
        break;
    }

    this.setState({ searchText: text, chars: items })
  }

  selectCharacter(item){
    item.type = this.state.type;
    this.state.navigation.navigate("SubmitCharacter", {item})
  }

  render() {
    return (
      <>
        <View style={[styles.slideContainer,{backgroundColor: chroma('white').hex()}]}>
          <View style={{height: 50, width: width, backgroundColor: chroma('black').alpha(.15)}}>
            <Text style={styles.text}>CHARACTERS</Text>
          </View>
          <View style={styles.slide}>
            <View style={styles.SeriesListView}>
              <FlatGrid
                itemDimension={100}
                items={this.state.chars}
                style={styles.gridView}
                spacing={10}
                renderItem={({item, index}) => 
                  <CharThumbNail waifuList={this.state.waifuList} users={this.state.users} char={item} userInfo={this.state.userInfo} selectCharacter={this.selectCharacter} />
                }
              />
            </View>
          </View>
        </View>

        <Searchbar
          placeholder="Search By Name"
          style={[styles.searchBar, {opacity: this.state.searchBarFocused ? 1 : .5}]}
          onBlur={() => this.setState({searchBarFocused: false})}
          onFocus={() => this.setState({searchBarFocused: true})}
          inputStyle={{fontFamily: "Edo", fontSize:15}}
          onChangeText={(text) => this.searchTextChange(text)}
          value={this.state.searchText}
        />
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
    fontSize: 30,
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
