import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import Autocomplete from 'react-native-autocomplete-input';
import { FlatGrid } from 'react-native-super-grid';

import watch from "redux-watch";
import _ from "lodash";

import Swiper from 'react-native-swiper'

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

export default class SearchSeries extends Component {
  constructor(props) {
    super(props);

    this.state = {
      navigation: props.navigation,
      type: props.route.params.type,
      origChars: props.route.params.chars,
      chars: _.cloneDeep(props.route.params.chars),
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

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ waifuList: newVal.waifuList })
    }))

    this.setState({
      waifuList: store.getState().data.waifuList
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
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
                itemDimension={150}
                items={this.state.chars}
                style={styles.gridView}
                spacing={20}
                renderItem={({item, index}) => {
                  const isSubmitted = this.state.waifuList.map(x => x.link).includes(item.link);

                  return(
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.selectCharacter(item)} style={styles.itemContainer}>
                      <Image
                        style={{
                          flex: 1,
                          resizeMode: "cover",
                          borderRadius: 10,
                          opacity: 1,
                          ...StyleSheet.absoluteFillObject,
                        }}
                        source={{uri: item.img}}
                      />
                      <View style={{height: 50,  padding: 2, backgroundColor: isSubmitted ? chroma('red') : chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
                        <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>{item.name.length > 15 ? item.name.slice(0,15) + '...' : item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                }}
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
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center"
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
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 250,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10
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
