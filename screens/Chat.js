import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, FAB, TouchableRipple, Card, Button, Badge } from 'react-native-paper';

import _ from 'lodash'

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

const mutedIcon = require('../assets/images/muteNotif.png');
const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

function Row({ item, index, selectChat }){
  const chatName = item.name ?? null;
  const chatImg = item.img ?? null;
  const isGroupChat = item.name != null;

  var user = store.getState().user.credentials;
  var otherUserId = item.users.filter(x => x != user.userId)[0];
  var otherUser = store.getState().user.otherUsers.filter(x => x.userId == otherUserId)[0];

  var styleRow = index % 2 == 0 ? styles.rowEven : styles.rowOdd;
  var textColor = index % 2 == 0 ? "black" : "white";

  var newMessageCount = 0;
  if(item.lastViewed != undefined)
    newMessageCount = item.messages.filter(x => new Date(x.createdAt) > new Date(item.lastViewed)).length

  return (
    <TouchableOpacity activeOpacity={.5} style={styleRow} onPress={() => selectChat(item)}>
      <ImageBackground source={{uri: chatImg ?? otherUser.img}}
       style={{height: 150, flexDirection:"row"}}
       imageStyle={{opacity: .25}}
       blurRadius={1}
       resizeMode="cover"
      >
        <View style={{width: 100, alignItems:"center", justifyContent:"center"}}>
          <View style={[styles.profileImg]}>
            <Image source={{uri: chatImg ?? otherUser.img}} style={[styles.profileImg]} />
          </View>
        </View>
        <View style={{flex: 1, alignItems:"center", justifyContent:"center"}}>
          <Text style={[styles.text, {fontSize: 35, color: textColor}]}>{ chatName ?? otherUser.userName}</Text>
        </View>
        <View style={{width: 75, alignItems:"center", justifyContent:"center"}}>
          <Text style={[styles.text, {fontSize: 25, color: textColor}]}>{item.messages.length}</Text>
          { newMessageCount > 0 ?
              <View style={{ position: "absolute", top: 0, right: 0, margin:8}}>
                <Badge>{newMessageCount}</Badge>
              </View>
            : <></>
          }
        </View>
          
        {
          item.muted.includes(user.userId) ?
            <Image source={mutedIcon} style={{height:25, width: 25, position:"absolute", top: 10, right: 10}} />
          :<></>
        }
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default class Chat extends Component {
  constructor(props) {
    super();

    this.mounted = true;
    this.state = {
      navigation: props.navigation,
			loading: store.getState().data.loading,
      userInfo: store.getState().user.credentials,
      chats: store.getState().chat.chats,
      size: {width,height}
    };

    this.selectChat = this.selectChat.bind(this)
    this.startNewChat = this.startNewChat.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }
  
  setSubscribes(){
    let chatReducerWatch = watch(store.getState, 'chat')
    let userReducerWatch = watch(store.getState, 'user')

    this.chatUnsubscribe = store.subscribe(chatReducerWatch((newVal, oldVal, objectPath) => {
      var chats = newVal.chats;
			this.setState({ chats })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ userInfo: newVal.credentials })
    }))
    
    var chats = store.getState().chat.chats;
    this.setState({ chats, userInfo: store.getState().user.credentials })
  }

  unSetSubscribes(){
    if(this.chatUnsubscribe != null)
      this.chatUnsubscribe()
    
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

  selectChat(chat){
    this.state.navigation.navigate("ViewChat", {chat})
  }

  startNewChat(){
    this.state.navigation.navigate("NewChat")
  }

  render(){
    return (
      <>
        {this.state.loading ?
          <></>
        :
          <View style={styles.container}>
            <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
              <Text style={styles.text}>CHATS</Text>
            </View>
            
            <FlatList
              data={_.orderBy(this.state.chats, "modifiedDate", "desc")}
              renderItem={({ item, index }) => <Row item={item} index={index} selectChat={this.selectChat} />}
              keyExtractor={item => item.chatId}
            />
            
            <FAB
              //small
              color="white"
              style={styles.fab}
              icon="message-text-outline"
              onPress={this.startNewChat}
            />
          </View>
        }
      </>
    );
  }
}

Chat.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: chroma('black').alpha(.5),
  },
  rowOdd:{
    backgroundColor: chroma('black').alpha(.75),
  },
  rowEven:{
    backgroundColor: chroma('white').alpha(.85),
  },
  profileImg:{
    height: 75,
    width: 75,
    borderRadius: 75,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
  },
  text:{
    fontFamily: "Edo",
    fontSize: 35,
    textAlign: "center"
  },
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    bottom: 4,
    backgroundColor: chroma('aqua').hex()
  },
})