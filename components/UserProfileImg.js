import React, { useState, useEffect, Component, PureComponent, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, TouchableHighlight,
   Image, ImageBackground, Dimensions, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

import * as firebase from 'firebase';

import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_USER
} from '../redux/types';
import store from '../redux/store';

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

export default function UserProfileImg(props) {
  const user = props.user;
  const [image, setImage] = useState(props.img);
  const [newImage, setNewImg] = useState(null);

  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    
    if (!result.cancelled) {
      console.log(result)
      setNewImg(result.uri);
    }
  };

  async function uploadImage(uri){
    store.dispatch({type: LOADING_UI})

    const response = await fetch(uri);
    const blob = await response.blob();

    var name = Date.now() + '-' + user.userName;
    var ref = await firebase.storage().ref('userProfiles').child(name);

    ref.put(blob)
    .then(() => {return firebase.storage().ref('userProfiles').child(name).getDownloadURL()})
    .then(async url => {
      return {url, user: await firebase.firestore().doc(`users/${user.userId}`).get()}
    })
    .then(async (obj) => {
      obj.user.ref.update({img: obj.url});
      return {url: obj.url, data: await firebase.firestore().collection(`waifuPoll`).get()}
    })
    .then((obj) => {
      obj.data.forEach((doc) => {
        var votes = doc.data().votes;
        var userVote = votes.filter(y => y.husbandoId == user.userId);
        if(userVote.length > 0){
          userVote[0].img = obj.url;
          doc.ref.update({ votes })
        }
      });
      
      setImage(obj.url)
      setNewImg(null)
      store.dispatch({type: STOP_LOADING_UI})
    })
    .catch(err => {
      console.log(err)
      store.dispatch({type: STOP_LOADING_UI})
    })
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={.5} style={[styles.profileImg]} onPress={pickImage}>
        <Image source={{uri: newImage ?? image}} style={[styles.profileImg]}/>
      </TouchableOpacity>
      
      {
        newImage != null ?
        <>
          <FAB
            //small
            color="white"
            style={styles.cancelFab}
            icon="cancel"
            onPress={() => setNewImg(null)}
          />

          <FAB
            //small
            color="white"
            style={styles.submitFab}
            icon="check"
            onPress={() => uploadImage(newImage)}
          />
        </>
        : <></>
      }
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    height: width/2,
    width: width/2,
    alignItems:"center",
    justifyContent:"center",
    position: 'relative',
  },
  profileImg:{
    height: width/2.25,
    width: width/2.25,
    borderRadius: width/2,
    marginTop: 5,
    marginBottom: 5,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
    position: 'absolute',
    zIndex: 1,
  },
  cancelFab: {
    position: 'absolute',
    zIndex: 2,
    left: -55,
    backgroundColor: chroma('red').hex()
  },
  submitFab: {
    position: 'absolute',
    zIndex: 2,
    right: -55,
    backgroundColor: chroma('#80ff80').hex()
  },
})