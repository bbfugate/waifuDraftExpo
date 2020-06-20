import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_CHATS,
  SET_SNACKBAR
} from '../types';

import * as firebase from 'firebase';

import store from '../store';
import _ from 'lodash'
import lz from "lz-string";

export async function addNewChat(chat){
  store.dispatch({ type: LOADING_UI });

  var chatId = await firebase.firestore().collection('chats').add(chat)
  .then(doc => {
    return doc.id;
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Sending Message`}
    });
  })
 
  store.dispatch({ type: STOP_LOADING_UI });

  return chatId;
}

export async function updateMessages(chat){
  store.dispatch({ type: LOADING_UI });

  var chatId = chat.chatId;
  delete chat.chatId;
  delete chat.lastViewed;
  
  await firebase.firestore().doc(`chats/${chatId}`).update(chat)
  .then(() => {
    console.log("message sent")
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Sending Message`}
    });
  })
 
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function leaveGroupChat(chat){
  store.dispatch({ type: LOADING_UI });

  var chatId = chat.chatId;
  delete chat.chatId;
  delete chat.lastViewed;

  if(chat.users.length > 0){
    await firebase.firestore().doc(`chats/${chatId}`).update(chat)
    .then(() => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "success", message: `You've Left The Group Chat`}
      });
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "error", message: `Error Leaving Group Chat`}
      });
    })
  }
  else{
    await firebase.firestore().doc(`chats/${chatId}`).delete()
    .then(() => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "success", message: `No More Users In Chat. Chat Has Been Deleted`}
      });
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "error", message: `Error Leaving Group Chat`}
      });
    })
  }
 
  store.dispatch({ type: STOP_LOADING_UI });
}