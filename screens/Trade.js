import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import watch from "redux-watch";
import _ from "lodash";

// Redux stuff
import store from "../redux/store";
import {
  LOADING_UI,
  STOP_LOADING_UI,
} from '../redux/types';

const { width, height } = Dimensions.get('window');
const chroma = require('chroma-js')

export default class Trade extends Component {
  constructor(props) {
    super(props);

    this.state = {
      navigation: props.navigation,
      otherUsers: store.getState().user.otherUsers,
      waifuList: store.getState().data.waifuList
    };

    this.selectOtherUser = this.selectOtherUser.bind(this);
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }
  
  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({...newVal})
    }))
    
    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({otherUsers: newVal.otherUsers})
    }))
    
    this.setState({
      otherUsers: store.getState().user.otherUsers,
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

  selectOtherUser(user){
    this.state.navigation.navigate("OtherUserProfile", {otherUser: user})
  }

  render() {
    return (
      <View style={styles.slideContainer}>
        <View style={styles.slide}>
          <View style={styles.SeriesListView}>
            <FlatGrid
              itemDimension={150}
              items={this.state.otherUsers}
              style={styles.gridView}
              spacing={20}
              renderItem={({item, index}) => {
                return(
                  <TouchableOpacity activeOpacity={.25} onPress={() => this.selectOtherUser(item)} style={styles.itemContainer}>
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
                    <View style={{ padding: 2, backgroundColor: chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
                      <Text style={{color: "white", fontFamily: "Edo", fontSize:30, textAlign: "center"}}>{item.userName}</Text>
                      
                      <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>POINTS - {item.points}</Text>
                      <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>SUBMIT SLOTS - {item.submitSlots}</Text>
                      <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>WAIFUS - {item.waifus.length}</Text>
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        </View>
      </View>
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
    backgroundColor: chroma('black').alpha(.15),
  },
  gridView: {
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 300,
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
