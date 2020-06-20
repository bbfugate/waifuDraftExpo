import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, Checkbox, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, KeyboardAvoidingView, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';

import _ from 'lodash'
import lz from "lz-string";
import Swiper from 'react-native-swiper'

import { addNewChat } from '../redux/actions/chatActions'

import store from '../redux/store'
import watch from 'redux-watch'
import e from 'cors';
import { SET_SNACKBAR } from '../redux/types';

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

function ChatUserRow({ item, index, selectUser }){
  var styleRow =  index % 2 == 0 ? styles.rowEven : styles.rowOdd;
  var textColor = index % 2 == 0 ? "black" : "white"
  const [isSelected, setIsSelected] = React.useState(false)

  function SelectUser(){
    setIsSelected(!isSelected)
    selectUser(item)
  }

  return (
    <TouchableOpacity activeOpacity={.5} style={styleRow} onPress={SelectUser}>
      <ImageBackground source={{uri: item.img}} style={{height: 100, flex:1, flexDirection:"row"}} imageStyle={{opacity: .75}} blurRadius={.5} resizeMode="cover" >
        <View style={{width: 100, alignItems:"center", justifyContent:"center"}}>
          <View style={[styles.profileImg]}>
            <Image source={{uri: item.img}} style={[styles.profileImg]} />
          </View>
        </View>
        <View style={{flex: 1, alignItems:"center", justifyContent:"center"}}>
          <Text style={[styles.text, {fontSize: 35, color: textColor}]}>{ item.userName}</Text>
        </View>
        <View style={{width: 75, alignItems:"center", justifyContent:"center", backgroundColor: chroma('white').alpha(.25)}}>
          <Checkbox
            status={isSelected ? 'checked' : 'unchecked'}
          />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default class ViewChat extends Component {
  constructor(props){
    super();

    this.state = {
      navigation: props.navigation,
      chatImg: null,
      chatName: null,
      chatUsers: [],
      userInfo: store.getState().user.credentials,
      otherUsers: store.getState().user.otherUsers,
    };
    
    this.selectUser = this.selectUser.bind(this)
    this.updateImgText = this.updateImgText.bind(this)
    this.createGroupChat = this.createGroupChat.bind(this)
    this.submitChatUsers = this.submitChatUsers.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
    this.handleSlideChange = this.handleSlideChange.bind(this)
  }

  setSubscribes(){
    let userReducerWatch = watch(store.getState, 'user')

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.credentials, otherUsers: newVal.otherUsers})
    }))
    
    var userInfo = store.getState().user.credentials;
    var otherUsers = store.getState().user.otherUsers;
    this.setState({
      userInfo,
      otherUsers
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
  
  selectUser(item){
    var chatUsers = _.cloneDeep(this.state.chatUsers);

    if(this.state.chatUsers.includes(item.userId)){
      chatUsers = chatUsers.filter(x => x != item.userId)
    }
    else{
      chatUsers.push(item.userId)
    }

    console.log(chatUsers)
    this.setState({ chatUsers })
  }

  submitChatUsers(){
    if(this.state.chatUsers.length > 1){//groupChat move to next sliide
      this.handleSlideChange("next")
    }
    else{
      var chat = {
        users: this.state.chatUsers.concat(this.state.userInfo.userId),
        messages: []
      }

      this.state.navigation.goBack() //move back to main chat screen
      this.state.navigation.navigate("ViewChat", {chat}) //navigate to viewChat
    }
  }

  handleSlideChange(slide){
    switch(slide){
      case "back":
        this.refs.swiper.scrollBy(-1)
        break;
      case "next":
        this.refs.swiper.scrollBy(1)
        break;
    }
  }
  
  updateImgText(text){
    if((text.match(/\.(jpeg|jpg|gif|png)$/) != null))
      this.setState({ chatImg: text})
  }

  async createGroupChat(){
    
    if(this.state.chatName == null){
      store.dispatch({type: SET_SNACKBAR, payload: {type: "error", message: "Add Group Name"}});
      return;
    }

    if(this.state.chatImg == null){
      store.dispatch({type: SET_SNACKBAR, payload: {type: "error", message: "Add Group Img"}});
      return;
    }

    var chat = {
      users: this.state.chatUsers.concat(this.state.userInfo.userId),
      name: this.state.chatName,
      img: this.state.chatImg,
      messages: [],
      modifiedDate: new Date()
    }

    chat.chatId = await addNewChat(chat);
    this.state.navigation.goBack() //move back to main chat screen
    this.state.navigation.navigate("ViewChat", {chat}) //navigate to viewChat
  }
  
  render(){
    return (
      <>
        <Swiper
          index={0}
          showsPagination={false}
          style={{backgroundColor: "white"}}
          scrollEnabled={false}
          loadMinimal
          ref='swiper'
        >
          <View style={[styles.container]}>
            <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
              <Text style={[styles.text, {color:"black"}]}>Select Players</Text>
            </View>
            
            <FlatList
              data={this.state.otherUsers}
              renderItem={({ item, index }) => <ChatUserRow item={item} index={index} selectUser={this.selectUser} />}
              keyExtractor={item => item.id}
            />
            {/*
            <FAB
              color="white"
              style={styles.backFab}
              icon="arrow-left-thick"
              onPress={() => this.handleSlideChange("back")}
            /> */}
            <FAB
              color="white"
              style={styles.nextFab}
              icon="arrow-right-thick"
              onPress={this.submitChatUsers}
            />
          </View>
        
          <View style={[styles.container, {backgroundColor: chroma('white')}]}>
            <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
              <Text style={[styles.text, {color:"black"}]}>GROUP INFO</Text>
            </View>
            
            <ImageBackground 
              source={{uri: this.state.chatImg}}
              resizeMode="cover"
              style={[styles.chatImg, {backgroundColor: this.state.chatImg != null ? 'transparent': 'white'}]}
            >
              <View style={{flex:1}}/>

              <View style={{height:75, width: width, justifyContent:"center", alignItems:"center"}}>
                <TextInput
                  label="Add Group Name"
                  underlineColor= "teal"
                  style={[styles.textField]}
                  value={this.state.chatName}
                  mode="Outlined"
                  onChangeText={(text) => this.setState({chatName: text})}
                />
              </View>

              <View style={{height:75, width: width, justifyContent:"center", alignItems:"center"}}>
                <TextInput
                  label="Add Goup Image Url"
                  underlineColor= "teal"
                  style={[styles.textField]}
                  value={this.state.chatImg}
                  mode="Outlined"
                  onChangeText={(text) => this.updateImgText(text)}
                />
              </View>

              <View style={{height: 50, width: width, alignItems: "center", justifyContent:"center" }}>
                <Button
                  style={{width: 250}}
                  mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  onPress={this.createGroupChat}
                >Create Group</Button>
              </View>
            </ImageBackground>
            
            <FAB
              color="white"
              style={styles.backFab}
              icon="arrow-left-thick"
              onPress={() => this.handleSlideChange("back")}
            />
          </View>
        
        </Swiper>
        
        <FAB
          color="white"
          style={styles.exitFab}
          icon="close"
          onPress={() => this.state.navigation.goBack()}
        />
      </>
    );
  }
}

ViewChat.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    position: "relative",
    backgroundColor: chroma('black').alpha(.5),
  },
  rowOdd:{
    backgroundColor: chroma('black').alpha(.75),
  },
  rowEven:{
    backgroundColor: chroma('white').alpha(.85),
  },
	textField: {
    position: "absolute",
    bottom: 15,
    width: '95%',
		backgroundColor: "white"
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
  chatImg:{
    flex:1,
    width: width,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 1,
    alignItems:"center",
    justifyContent:"center",
    position: "relative"
  },
  text:{
    fontFamily: "Edo",
    fontSize: 35,
    textAlign: "center"
  },
  nextFab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    bottom: 8,
    backgroundColor: chroma('aqua').hex()
  },
  backFab: {
    position: 'absolute',
    zIndex: 20,
    margin: 8,
    left: 0,
    top: 8,
    backgroundColor: chroma('red').hex()
  },
  exitFab: {
    position: 'absolute',
    zIndex: 10,
    margin: 8,
    right: 0,
    top: 8,
    backgroundColor: chroma('red').hex()
  },
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    bottom: 4,
    backgroundColor: chroma('aqua').hex()
  },
})