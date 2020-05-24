import {
  SET_WEEKLY_POLL,
  SET_DAILY_POLL,
  SET_POLL_WAIFUS,
  SET_SEARCH_DATA,
  SET_TRADES,
  SET_SNACKBAR,
  SUBMIT_WAIFU,
  CLEAR_ERRORS,
  LOADING_DATA,
  STOP_LOADING_DATA,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_OTHER_USERS,
  SET_WAIFU_LIST,
  UNSUB_SNAPSHOTS,
  SUB_SNAPSHOTS,
  SET_GAUNTLET,
  SET_USER
} from '../types';
import firebase, { firestore } from 'firebase/app';
import axios from 'axios';
import 'firebase/auth';
import store from '../store';
import jwtDecode from 'jwt-decode';
import _ from 'lodash'
import lz from "lz-string";

  export async function getSearchData(){
    store.dispatch({ type: LOADING_UI });
    var returnObj = await firebase.storage().ref('filters/SearchFile.json').getDownloadURL()
    .then(function(url) {
      return fetch(url);
    })
    .then(response => response.json())
    .then((jsonData) => {
      return JSON.parse(lz.decompress(jsonData));
    })
    .catch((error) => {
      console.error(error)
    })

    store.dispatch({ type: SET_SEARCH_DATA, payload: returnObj });
    store.dispatch({ type: STOP_LOADING_UI });
  }

  export async function submitWeeklyVote(voteCount, waifu){
    store.dispatch({ type: LOADING_UI });

    var voteObj = {
      vote: voteCount,
      husbando: store.getState().user.credentials.userName,
      husbandoId: store.getState().user.credentials.userId,
      img: store.getState().user.credentials.img
    };

    await axios.post('/submitWeeklyVote', {waifuId: waifu.waifuId ,voteObj})
    .then((res) => {
      console.log(res.data)
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: err
      });
    });
    
    store.dispatch({ type: STOP_LOADING_UI });
  }

  export async function submitDailyVote(voteCount, waifu){
    store.dispatch({ type: LOADING_UI });

    var voteObj = {
      vote: voteCount,
      husbando: store.getState().user.credentials.userName,
      husbandoId: store.getState().user.credentials.userId,
      img: store.getState().user.credentials.img
    };
    
    await axios.post('/submitDailyVote', {waifuId: waifu.waifuId, voteObj})
    .then((res) => {
      console.log(res.data)
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: err
      });
    });
    
    store.dispatch({ type: STOP_LOADING_UI });
  }

  export async function submitWaifu(waifuData){
    store.dispatch({ type: LOADING_UI });

    await axios.post('/submitWaifu', waifuData)
    .then((res) => {
      console.log(res.data)
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: err
      });
    });
    
    store.dispatch({ type: STOP_LOADING_UI });
  }

  export function buyWaifu(waifu){
    var user = store.getState().user.credentials;
    var price = waifu.rank * 5;

    firebase.firestore().doc(`waifus/${waifu.waifuId}`).update({ husbando: user.userName, husbandoId: user.userId})
    .then(() => {
      return firebase.firestore().doc(`users/${user.userId}`).update({ points: user.points - price});
    })
    .then(() =>{
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{type:"success", message: `${waifu.name} was purchased`}]
      });
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{type:"error", message: err.message}]
      });
    })
  }
  
  export function submitTrade(trade){
    var poll = store.getState().data.poll;
    if(!poll.isActive){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "error", message: "Cannot Submit Trade During Active Poll" }]
      });
    }

    trade.status = "Active";

    firebase.firestore().collection("trades").add({...trade})
    .then(() => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "success", message: "Trade Successfully Submitted" }]
      });
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "error", message: "Error Submitting Trade" }]
      });
    });
  }

  export function updateTrade(trade, status){
    firebase.firestore().doc(`trades/${trade.id}`).update({status})
  }

  export async function fightBoss(bossFightObj){
    var uid = await firebase.auth().currentUser.uid;
    var waifu = (await firebase.firestore().doc(`waifus/${bossFightObj.waifuId}`).get())
    var boss = (await firebase.firestore().doc(`gauntlet/${bossFightObj.bossId}`).get())
    var fights = _.cloneDeep(boss.data().fights);
    var userFightRec = fights.filter(x => x.husbandoId == uid)
    if(_.isEmpty(userFightRec)){
      userFightRec = {
        husbandoId: uid,
        waifusUsed: [],
        defeated: false
      }
      fights.push(userFightRec);
      userFightRec = fights.filter(x => x.husbandoId == uid)[0];
    }
    else{
      userFightRec = userFightRec[0]
    }

    var rolls = [];
    for(var i = 0; i < bossFightObj.diceCount; i++){
      rolls.push(randomNumber(1, bossFightObj.attack))
    }

    var totalDmg = rolls.reduce((a, b) => a + b, 0);

    var rewardResult = "";
    var fightResult = 0;
    //calculates final result
    if(totalDmg > bossFightObj.bossHp){
      fightResult = 1;
      rewardResult = await buildBossRewardStr(bossFightObj.bossReward);
      userFightRec.waifusUsed.push(waifu.id)
      userFightRec.defeated = true;

/*       store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "Success", message: "You've Defeated The Boss!" }]
      }); */
    }
    else{
      if((bossFightObj.bossHp - totalDmg) > bossFightObj.defense)
      {
        fightResult = 2;
        rewardResult = "Waifu Lost And Was Sent To Shop!";
        userFightRec.waifusUsed.push(waifu.id)
        await waifu.ref.update({husbando: "Shop", husbando:""})

/*         store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "Warning", message: "Your Waifu Was Lost To The Shop" }]
        }); */
      }
      else
      {
        fightResult = 3;
        rewardResult = "Boss Not Defated. No Reward";
        userFightRec.waifusUsed.push(waifu.id)
      }
    }

    await boss.ref.update({fights})

    return {totalDmg, rolls, fightResult, rewardResult}
  }

  export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
  }

  export async function setRealTimeListeners(userId){
    store.dispatch({ type: LOADING_UI });
    
    var unSubUser = await firebase.firestore().doc(`/users/${userId}`).onSnapshot(function(doc) {
      if (!doc.exists) {
/*         store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message: "No User" }]
        }); */
        return;
      }

      var oldUser = _.cloneDeep(store.getState().user)
      var user = _.cloneDeep(store.getState().user)
      user.credentials = {...doc.data(), userId: doc.id};
      firebase.firestore().collection('waifus')
      .where('husbandoId', '==', user.credentials.userId).get()
      .then((data) => {
        user.waifus = [];
        data.forEach((doc) => {
          user.waifus.push({...doc.data(), id: doc.id});
        });

        store.dispatch({
          type: SET_USER,
          payload: {credentials: user.credentials, waifus: user.waifus}
        });

        if(oldUser.credentials != null && !_.isEqual(oldUser.credentials, user.credentials)){
/*           store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message: "User Data Updated" }]
          }); */
        }
      })
      .catch(err => {
      });
    });
    
    var unSubOtherUsers = await firebase.firestore().collection('users').onSnapshot(async function(data) {
      var otherUsers = [];

      var waifus = store.getState().data.waifuList;
      if(waifus.length == 0){
        waifus = await firebase.firestore().collection('waifus').get()
        .then((data) => {
          var arr = [];
          data.forEach((doc) => {
            arr.push({...doc.data(), id: doc.id});
          });
          
          return arr
        })
        .catch(err => {
          console.log(err)
        });
      }

      data.forEach(x => {
        if(x.id != userId){
          var nUser = {
            userId: x.id,
            userName: x.data().userName,
            points: x.data().points,
            submitSlots: x.data().submitSlots,
            rankCoins: x.data().rankCoins,
            statCoins: x.data().statCoins,
            img: x.data().img,
            waifus: waifus.filter(y => y.husbandoId == x.id)
          };
  
          otherUsers.push(nUser);
        }
      })

      store.dispatch({
        type: SET_OTHER_USERS,
        payload: {otherUsers}
      });
    });
    
    var unSubTrades = await firebase.firestore().collection('trades').onSnapshot(async function(data) {
      var trades = [];

      var waifus = store.getState().data.waifuList;
      if(waifus.length == 0){
        waifus = await firebase.firestore().collection('waifus').get()
        .then((data) => {
          var arr = [];
          data.forEach((doc) => {
            arr.push({...doc.data(), id: doc.id});
          });
          
          return arr
        })
        .catch(err => {
          console.log(err)
        });
      }

      data.forEach(x => {
        var trade = x.data();
        trade.id = x.id;
        var fromWaifus = waifus.filter(y => trade.from.waifus.includes(y.link))
        var toWaifus = waifus.filter(y => trade.to.waifus.includes(y.link))

        trade.from.waifus = fromWaifus;
        trade.to.waifus = toWaifus;

        trades.push(trade)
      })

      store.dispatch({
        type: SET_TRADES,
        payload: trades
      });
    });    
    
    var unSubWaifus = await firebase.firestore().collection("waifus").onSnapshot(function(querySnapshot) {
      var waifus = [];
      querySnapshot.forEach(function(doc) {
        waifus.push({...doc.data(), waifuId: doc.id})
      });

      store.dispatch({ type: SET_WAIFU_LIST, payload: waifus });
    });

    var unSubPollWaifus = await firebase.firestore().collection("waifuPoll").onSnapshot(function(querySnapshot) {
      var poll = {
        weekly: [],
        daily: [],
      };
      try{
        querySnapshot.forEach(function(doc) {
          if(doc.data().husbando == "Poll")
            poll.weekly.push({...doc.data(), waifuId: doc.id})
          else
            poll.daily.push({...doc.data(), waifuId: doc.id})
        });
  
        store.dispatch({
          type: SET_POLL_WAIFUS,
          payload: poll
        });
      }
      catch(err){
        console.log(err);
        store.dispatch({
          type: SET_POLL_WAIFUS,
          payload: {}
        });
      }
    });
    
    var unSubWeeklyPoll = await firebase.firestore().doc("poll/weekly").onSnapshot(function(doc) {
      try{
        var pollObj = {...doc.data()};
        store.dispatch({
          type: SET_WEEKLY_POLL,
          payload: pollObj
        });
      }
      catch(err){
        console.log(err);
        store.dispatch({
          type: SET_WEEKLY_POLL,
          payload: null
        });
      }
    });
    
    var unSubDailyPoll = await firebase.firestore().doc("poll/daily").onSnapshot(function(doc) {
      try{
        var pollObj = {...doc.data()};

        store.dispatch({
          type: SET_DAILY_POLL,
          payload: pollObj
        });
      }
      catch(err){
        console.log(err);
        store.dispatch({
          type: SET_DAILY_POLL,
          payload: null
        });
      }
    });
    
    var unSubGauntlet = await firebase.firestore().collection("gauntlet").onSnapshot(function(querySnapshot) {
      try{
        var bosses = [];
        querySnapshot.forEach(function(doc) {
          bosses.push({bossId: doc.id , ...doc.data()});
        });

        store.dispatch({
          type: SET_GAUNTLET,
          payload: bosses
        });
      }
      catch(err){
        console.log(err);
        store.dispatch({
          type: SET_GAUNTLET,
          payload: []
        });
      }
    });

    store.dispatch({ type: SUB_SNAPSHOTS, payload: {unSubUser, unSubOtherUsers, unSubWaifus, unSubPollWaifus, unSubDailyPoll, unSubWeeklyPoll, unSubTrades, unSubGauntlet} })
    store.dispatch({ type: STOP_LOADING_UI });
  }
  
  async function buildBossRewardStr(reward){
    var result = "Boss Was Defeated! Rewards Gained:";
    var rewards = _.keys(reward);
    var uid = await firebase.auth().currentUser.uid;
    var user = await firebase.firestore().doc(`users/${uid}`).get()

    rewards.forEach(x => {
      switch(x){
        case "points":
          result += `\n ${reward[x]} Points`
          user.ref.update({points: user.data().points + reward[x]})
          /*store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message:  `${reward[x]} Points Added` }]
          }); */
          break;
        case "statCoins":
          result += `\n ${reward[x]} Stat Coins`
          user.ref.update({statCoins: user.data().statCoins + reward[x]})
          /*store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message: `${reward[x]} Stat Coins Added` }]
          }); */
          break;
        case "rankCoins":
          result += `\n ${reward[x]} Rank Coins`
          user.ref.update({rankCoins: user.data().rankCoins + reward[x]})
          /*store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message: `${reward[x]} Rank Coins Added` }]
          }); */
          break;
      }
    })

    return result;
  }

  function randomNumber(min, max) {  
    return Math.random() * (max - min) + min; 
  }
