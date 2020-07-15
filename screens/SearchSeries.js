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
      origSearchItems: props.route.params.series,
      searchItems: _.cloneDeep(props.route.params.series),
      chars: props.route.params.chars,
      searchText: "",
      searchBarFocused: false,
    };

    this.searchTextChange = this.searchTextChange.bind(this);
    this.loadCharacters = this.loadCharacters.bind(this);
    this.selectSeries = this.selectSeries.bind(this);
  }

  searchTextChange(text){
    var origSearchItems = _.cloneDeep(this.state.origSearchItems);
    var items = origSearchItems;

    if (text != "" && text != null) {
      items = _.filter(items, function (item) {
        return item.name.toLowerCase().includes(text.toLowerCase());
      });
    }
    this.setState({ searchText: text, searchItems: items })
  }

  loadCharacters(chars){
    this.state.navigation.navigate("SearchCharacters", {chars, type: "Anime-Manga"})
  }

  selectSeries(series){
    var charData = _.cloneDeep(this.state.chars);

    if (series.name != null) {
      charData = _.filter(charData, function (item) {
        if (item.animes.map((x) => x.toLowerCase()).includes(series.name.toLowerCase()) ||
          item.mangas.map((x) => x.toLowerCase()).includes(series.name.toLowerCase()))
          return true;
      });
    }

    this.loadCharacters(charData)
  }

  render() {
    return (
      <>
        <Swiper
          index={0}
          showsPagination={false}
          style={styles.container}
          bounces
        >
          <View style={[styles.slideContainer,{backgroundColor: chroma('white').alpha(.85).hex()}]}>
            <View style={{height: 50, width: width, backgroundColor: chroma('black').alpha(.15)}}>
              <Text style={styles.text}>ANIMES</Text>
            </View>
            <View style={styles.slide}>
              <View style={styles.SeriesListView}>
                <FlatGrid
                  itemDimension={150}
                  items={this.state.searchItems.filter(x => x.link.includes("/anime/"))}
                  style={styles.gridView}
                  spacing={20}
                  renderItem={({item, index}) => {
                    return(
                      <TouchableOpacity activeOpacity={.25} onPress={() => this.selectSeries(item)} style={styles.itemContainer}>
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
                        <View style={{height: 50,  padding: 2, backgroundColor: chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
                          <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>{item.name.length > 15 ? item.name.slice(0,15) + '...' : item.name}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                />
              </View>
            </View>
          </View>

          <View style={[styles.slideContainer,{backgroundColor: chroma('black').alpha(.15)}]}>
            <View style={{height: 50, width: width, backgroundColor: chroma('white').alpha(.15)}}>
              <Text style={styles.text}>MANGAS</Text>
            </View>
            <View style={styles.slide}>
              <View style={styles.SeriesListView}>
                <FlatGrid
                  itemDimension={150}
                  items={this.state.searchItems.filter(x => x.link.includes("/manga/"))}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    return(
                      <TouchableOpacity activeOpacity={.25} onPress={() => this.selectSeries(item)} style={styles.itemContainer}>
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
                        <View style={{height: 50,  padding: 2, backgroundColor: chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
                          <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>{item.name.length > 15 ? item.name.slice(0,15) + '...' : item.name}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                />
              </View>
            </View>
          </View>
        </Swiper>
        
        <Searchbar
          placeholder="Search By Name"
          style={[styles.searchBar, {width: width * .8, opacity: this.state.searchBarFocused ? 1 : .5}]}
          onBlur={() => this.setState({searchBarFocused: false})}
          onFocus={() => this.setState({searchBarFocused: true})}
          inputStyle={{fontFamily: "Edo", fontSize:15}}
          onChangeText={(text) => this.searchTextChange(text)}
          value={this.state.searchText}
        />
        <FAB
          //small
          color="white"
          style={styles.fab}
          icon="account-multiple"
          onPress={() => this.loadCharacters(this.state.chars)}
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
    position: 'absolute',
    zIndex: 10,
    margin: 12,
    left: 0,
    bottom: 0,
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
