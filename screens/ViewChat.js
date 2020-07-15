import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, Menu, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, KeyboardAvoidingView, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import { Feather } from '@expo/vector-icons';

import _ from 'lodash'
import lz from "lz-string";
import { addNewChat, updateMessages, leaveGroupChat, toggleMute } from '../redux/actions/chatActions'

import store from '../redux/store'
import watch from 'redux-watch'
import {
  SET_LAST_VIEWED
} from '../redux/types'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');
export default class ViewChat extends Component {
  constructor(props){
    super();

    var users = props.route.params.chat.users;
    this.isGroupChat = props.route.params.chat.name != null;
    this.chatId = props.route.params.chat.chatId;
    this.chatImg = props.route.params.chat.img ?? null;
    this.chatName = props.route.params.chat.name ?? null;
    this.state = {
      users,
      navigation: props.navigation,
      chat: props.route.params.chat,
      showOptions: false,
      otherUsers: store.getState().user.otherUsers.filter(x => users.includes(x.userId)),
      userInfo: store.getState().user.credentials,
    };
    
    this.onSend = this.onSend.bind(this)
    this.leaveChat = this.leaveChat.bind(this)
    this.toggleMute = this.toggleMute.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let chatReducerWatch = watch(store.getState, 'chat')
    let userReducerWatch = watch(store.getState, 'user')

    this.chatUnsubscribe = store.subscribe(chatReducerWatch((newVal, oldVal, objectPath) => {
      var chat = this.state.chat;
      if(this.chatId != null){
        chat = newVal.chats.filter(x => x.chatId == this.chatId)[0]
      }
      
      this.setState({ chat })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.credentials})
    }))
    
    var userInfo = store.getState().user.credentials;
    var chat = this.state.chat;
    if(this.state.chat.chatId != null){
      chat = store.getState().chat.chats.filter(x => x.chatId == this.state.chat.chatId)[0]
    }
    
    this.setState({
      chat,
      userInfo,
    })
  }

  unSetSubscribes(){
    if(this.chatUnsubscribe != null)
      this.chatUnsubscribe()
    
    if(this.userUnsubscribe != null)
      this.userUnsubscribe()

    store.dispatch({ type: SET_LAST_VIEWED, payload: {chatId: this.chatId, lastViewed: new Date()}})
  }
  
  componentDidMount(){
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
  }

  async onSend(messages = []) {
    var chat = _.cloneDeep(this.state.chat);
    var messages = GiftedChat.append(chat.messages, messages);
    var encryptMsgs = messages.map(x => lz.compressToUTF16(JSON.stringify(x)))
    chat.messages = encryptMsgs;
    
    if(this.chatId == null){
      this.chatId = await addNewChat(chat);
    }
    else{
      await updateMessages(chat);
    }
  }
  
  async leaveChat(){
    var chat = _.cloneDeep(this.state.chat);
    chat.users = chat.users.filter(x => x != this.state.userInfo.userId);

    leaveGroupChat(chat);
    this.state.navigation.goBack()
  }

  async toggleMute(){
    toggleMute(this.chatId, this.state.userInfo.userId)
  }
  
  render(){
    return (
      <View style={[styles.container]}>
        <ImageBackground source={{uri: this.chatImg ?? this.state.otherUsers[0].img}} style={{flex:1}} imageStyle={{opacity: .5}} blurRadius={.5} resizeMode="cover">
          <View style={{width: width, padding: 8, backgroundColor: chroma('white')}}>
            <View style={{width: 50, height: 50, position: "absolute", zIndex: 2, right: 0, top: 5,
              flexDirection: 'row',
              justifyContent: 'center'}}
            >
              <Menu
                visible={this.state.showOptions}
                onDismiss={() => this.setState({showOptions: false})}
                anchor={
                  <Button onPress={() => this.setState({showOptions: true})}>
                    <Feather name="settings" size={24} color="black" />
                  </Button>
                }
              >
                {
                  this.state.chat.chatId != null ?
                    <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => this.toggleMute()}
                      title={this.state.chat.muted.includes(this.state.userInfo.userId) ? "Unmute Chat" : "Mute Chat"} />
                  :<></>
                }
                {
                  this.isGroupChat ?
                    <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={this.leaveChat} title="Leave Chat" />
                  : <></>
                }
              </Menu>
            </View>
            <View style={{height: "auto"}}>
              <Text style={[styles.text, {color:"black"}]}>{this.chatName ?? this.state.otherUsers[0].userName}</Text>
            </View>
          </View>

          <GiftedChat
            messages={_.orderBy(this.state.chat.messages, "modifiedDate", "desc")}
            onSend={messages => this.onSend(messages)}
            showUserAvatar
            infiniteScroll
            scrollToBottom
            renderUsernameOnMessage
            user={{
              _id: this.state.userInfo.userId,
              name: this.state.userInfo.userName,
              avatar: this.state.userInfo.img,
            }}
          />
          
        </ImageBackground>
      </View>
    );
  }
}

ViewChat.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    top: 0,
    backgroundColor: chroma('aqua').hex()
  },
});
