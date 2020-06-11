import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'

import _ from 'lodash'
import { submitVote } from '../redux/actions/dataActions'

import store from '../redux/store'
import watch from 'redux-watch'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');
export default class ViewChat extends Component {
  constructor(props){
    super();

    var users = props.route.params.users;

    this.state = {
      navigation: props.navigation,
      chat: props.route.params.chat,
      users,
      otherUsers: store.getState().user.otherUsers.filter(x => users.includes(x.userId)),
      userInfo: store().getState().user.credentials,
    };
    
    this.onSend = this.onSend.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    let chatReducerWatch = watch(store.getState, 'chat')
    let userReducerWatch = watch(store.getState, 'user')

    this.chatUnsubscribe = store.subscribe(chatReducerWatch((newVal, oldVal, objectPath) => {
      var chat = this.state.chat;
      if(this.state.chat.chatId != null){
        chat = store.getState().chat.chats.filter(x => x.chatId == this.state.chat.chatId)[0]
      }

      if(!_.isEmpty(newVal.chats.filter(x => x.chatId == this.state.chat.chatId))){
        chat = newVal.chats.filter(x => x.chatId == this.state.chat.chatId)[0]
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
  }
  
  componentDidMount(){
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
  }

  onSend(messages = []) {
    var chat = this.state.chat;
    chat.messages = GiftedChat.append(chat.messages, messages)

    this.setState({
      chat
    })
  }
  
  render(){
    return (
      <View style={[styles.container]}>
        <GiftedChat
          messages={this.state.chat.messages}
          onSend={messages => this.onSend(messages)}
        />
        {
          Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
        }
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
  detailsView:{
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    top: 0,
    backgroundColor: chroma('aqua').hex()
  },
});
