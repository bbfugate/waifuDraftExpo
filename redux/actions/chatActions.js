import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_MESSAGES
} from '../types';

import * as firebase from 'firebase';

import store from '../store';
import _ from 'lodash'
import lz from "lz-string";

export async function getChatMessages(){
  store.dispatch({ type: LOADING_UI });

  var returnObj = await firebase.storage().ref('filters/SearchFile.json').getDownloadURL()
  .then(function(url) {
    return fetch(url);
  })
  .then(response => {
    console.log("got data")
    return response.json()
  })
  .then((jsonData) => {
    console.log("parse data")
    return lz.decompress(jsonData);
  })
  .then((data) => {
    return JSON.parse(data);
  })
  .catch((err) => {
    console.log(err)
  })

  store.dispatch({ type: SET_SEARCH_DATA, payload: returnObj });  
  store.dispatch({ type: STOP_LOADING_UI });
}
