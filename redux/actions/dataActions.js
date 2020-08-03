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
  SET_USER,
  SET_CHATS
} from '../types';

import * as firebase from 'firebase';
import 'firebase/auth';

import axios from 'axios';
import store from '../store';
import _ from 'lodash'
import lz from "lz-string";

export async function getSearchData(){
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

export async function useRankCoin(waifu, rankCoins, points, statCoins){
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.credentials;
	await firebase.firestore().doc(`waifus/${waifu.waifuId}`).get()
	.then(doc => {
		var stats = getBaseStats(doc.data().rank + 1);
		return doc.ref.update({ ...stats })
	})
	.then(() => {
		return firebase.firestore().doc(`users/${user.userId}`).get()
	})
	.then(doc => {
    var user = doc.data();
    var newPoints = user.points - points;
    var newRankCoins = user.rankCoins - rankCoins;
    var newStatCoins = user.statCoins - statCoins;

		return doc.ref.update({ points: newPoints, statCoins: newStatCoins, rankCoins: newRankCoins });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name} Has Been Ranked Up`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Ranking Up Waifu`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function useStatCoin(waifu, stats){
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.credentials;
	await firebase.firestore().doc(`waifus/${waifu.waifuId}`).get()
	.then(doc => {
    var waifu = doc.data()
    waifu.attack = waifu.attack + stats.attack;
    waifu.defense = waifu.defense + stats.defense;
		
		return doc.ref.set(waifu)
	})
	.then(() => {
		return firebase.firestore().doc(`users/${user.userId}`).get()
	})
	.then(doc => {
		return doc.ref.update({ statCoins: doc.data().statCoins - (stats.attack + stats.defense) });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name}'s stats have been updated`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Using Stat Coin(s)`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function updateWaifuImg(waifu, imgUrl){
  var success = false;
  store.dispatch({ type: LOADING_UI });
  
  await firebase.firestore().doc(`waifus/${waifu.waifuId}`).update({img : imgUrl})
  .then(() => {
    success = true;
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `Updated Waifu Image`}
    });
  })
  .catch((err) => {
    success = false;
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Updating Waifu Image`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });

  return success
}

export async function submitVote(voteCount, waifu){
  store.dispatch({ type: LOADING_UI });

  console.log(voteCount)

  var voteObj = {
    vote: voteCount,
    husbandoId: store.getState().user.credentials.userId,
    img: store.getState().user.credentials.img
  };

  await firebase.firestore().doc(`waifuPoll/${waifu.waifuId}`).get()
  .then(doc => {
    var votes = doc.data().votes;
    var newVoteObj = votes.filter(x => x.husbandoId == voteObj.husbandoId);
    if(_.isEmpty(newVoteObj)){        
      return doc.ref.update({ votes: firebase.firestore.FieldValue.arrayUnion(voteObj) })
    }
    else{
      newVoteObj = newVoteObj[0]
      newVoteObj.vote = newVoteObj.vote + voteObj.vote;
      return doc.ref.update({ votes })
    }
  })
  .then(() => {
    return firebase.firestore().doc(`users/${voteObj.husbandoId}`).get()
  })
  .then(doc => {
    return doc.ref.update({points: doc.data().points - voteObj.vote})
  })
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `Vote Has Been Submitted`}
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: err.message}
    });
  })
  // await axios.post('/submitVote', {waifuId: waifu.waifuId, voteObj})
  // .then((res) => {
  //   console.log(res.data)
  // })
  // .catch((err) => {
  //   store.dispatch({
  //     type: SET_SNACKBAR,
  //     payload: err
  //   });
  // });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function submitWaifu(waifuData){
  store.dispatch({ type: LOADING_UI });

  var user = store.getState().user.credentials;
  await firebase.firestore().collection("waifus").where("link", "==", waifuData.link).get()
  .then((data) => {

    if(data.length > 0)
      throw "Waifu Already Submitted";

    waifuData.husbandoId = "Weekly"
    waifuData.submittedBy = user.userName;
    waifuData.type = waifuData.publisher != null ? waifuData.publisher : waifuData.type = "Anime-Manga";
    
    waifuData.rank = 1;
    waifuData.attack = 3;
    waifuData.defense = 1;
    return firebase.firestore().collection("waifus").add(waifuData)
  })
  .then(() => {
    return firebase.firestore().doc(`/users/${user.userId}`).get()
  })
  .then((doc) => {
    var updtUser = doc.data();
    updtUser.submitSlots = updtUser.submitSlots - 1;
    return firebase.firestore().doc(`/users/${user.userId}`).set(updtUser)
  })
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifuData.name} Was Submitted`}
    });
  })
  .catch((err) => {
    console.log(err)
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: "Error Submitting Waifu"}
    });
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function toggleWishListWaifu(link){
  store.dispatch({ type: LOADING_UI });

  var userId = store.getState().user.credentials.userId;
  await firebase.firestore().doc(`users/${userId}`).get()
  .then((doc) => {
    var user = doc.data();

    var wishList = user.wishList;
    if(wishList.includes(link)){
      wishList = wishList.filter(x => x != link);
    }
    else{
      wishList.push(link)
    }

    doc.ref.update({wishList})
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function buyWaifu(waifu){
  store.dispatch({ type: LOADING_UI });

  var price = waifu.rank * 5;
  var user = store.getState().user.credentials;
  var remPoints = user.points - price;
  await firebase.firestore().doc(`waifus/${waifu.waifuId}`).update({husbandoId: user.userId})
  .then(() => {
    return firebase.firestore().doc(`users/${user.userId}`).update({points: remPoints});
  })
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name} Was Purchased`}
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Buying Waifu From Shop`}
    });
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function submitTrade(trade){
  store.dispatch({ type: LOADING_UI });

  // var weeklyPoll = store.getState().data.poll.weekly;
  // if(weeklyPoll.isActive){
  //   store.dispatch({
  //     type: SET_SNACKBAR,
  //     payload: [{ type: "error", message: "Cannot Submit Trade During Active Poll" }]
  //   });
    
  //   store.dispatch({ type: STOP_LOADING_UI });
  //   return
  // }

  trade.status = "Active";
  trade.createdDate = new Date();

  await firebase.firestore().collection("trades").add({...trade})
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: { type: "success", message: "Trade Successfully Submitted" }
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: { type: "error", message: "Error Submitting Trade" }
    });
  });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function updateTrade(trade, status){
  store.dispatch({ type: LOADING_UI });

  await firebase.firestore().doc(`trades/${trade.id}`).update({status})
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `Trade Was ${status}`}
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Updating Trade`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function fightBoss(bossFightObj){
  store.dispatch({ type: LOADING_UI })

  var uid = await firebase.auth().currentUser.uid;
  var waifuRef = (await firebase.firestore().doc(`waifus/${bossFightObj.waifuId}`).get())
  var waifu = waifuRef.data()

  var bossRef = (await firebase.firestore().doc(`gauntlet/${bossFightObj.bossId}`).get())
  var boss = bossRef.data()

  var fights = _.cloneDeep(boss.fights);

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
  for(var i = 0; i < waifu.rank; i++){
    rolls.push(_.random(1, waifu.attack))
  }

  var totalDmg = rolls.reduce((a, b) => a + b, 0);

  var rewardResult = "";
  var fightResult = 0;

  //calculates final result
  if(totalDmg >= boss.hp){
    fightResult = 1;
    rewardResult = await buildBossRewardStr(boss.reward);
    userFightRec.waifusUsed.push(bossFightObj.waifuId)
    userFightRec.defeated = true;
  }
  else{
    if((boss.hp - totalDmg) >= waifu.defense)
    {
      fightResult = 2;
      rewardResult = "Waifu Has Been Defeated And Was Sent To Shop";
      userFightRec.waifusUsed.push(bossFightObj.waifuId)
      await waifuRef.ref.update({husbandoId: "Shop"})
    }
    else
    {
      fightResult = 3;
      rewardResult = "Boss Not Defated. No Reward";
      userFightRec.waifusUsed.push(bossFightObj.waifuId)
    }
  }

  await bossRef.ref.update({fights})

  store.dispatch({ type: STOP_LOADING_UI })
  return {totalDmg, rolls, fightResult, rewardResult}
}

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
}

export async function setRealTimeListeners(userId){
  store.dispatch({ type: LOADING_UI });
  
  var unSubUser = firebase.firestore().doc(`/users/${userId}`).onSnapshot(function(doc) {
    if (!doc.exists) {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: { type: "info", message: "No User" }
      });
      return;
    }

    var user = _.cloneDeep(store.getState().user)
    user.credentials = {...doc.data(), userId: doc.id};
    firebase.firestore().collection('waifus')
    .where('husbandoId', '==', user.credentials.userId).get()
    .then((data) => {
      user.waifus = [];
      data.forEach((doc) => {
        user.waifus.push(doc.id);
      });

      store.dispatch({
        type: SET_USER,
        payload: {credentials: user.credentials, waifus: user.waifus}
      });

      // if(oldUser.credentials != null && !_.isEqual(oldUser.credentials, user.credentials)){
      //   store.dispatch({
      //     type: SET_SNACKBAR,
      //     payload: { type: "info", message: "User Data Updated" }
      //   });
      // }
    })
    .catch(err => {
      console.log(err)
    });
  });
  
  var unSubOtherUsers = firebase.firestore().collection('users').onSnapshot(async function(data) {
    var otherUsers = [];

    var waifus = store.getState().data.waifuList;
    if(waifus.length == 0){
      waifus = await firebase.firestore().collection('waifus').get()
      .then((data) => {
        var arr = [];
        data.forEach((doc) => {
          arr.push({...doc.data(), waifuId: doc.id});
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
          wishList: x.data().wishList,
          img: x.data().img,
          waifus: waifus.filter(y => y.husbandoId == x.id).map(x => x.waifuId)
        };

        otherUsers.push(nUser);
      }
    })

    store.dispatch({
      type: SET_OTHER_USERS,
      payload: {otherUsers}
    });
  });
  
  var unSubTrades = firebase.firestore().collection('trades').onSnapshot(async function(data) {
    var trades = [];

    var waifus = store.getState().data.waifuList;
    if(waifus.length == 0){
      waifus = await firebase.firestore().collection('waifus').get()
      .then((data) => {
        var arr = [];
        data.forEach((doc) => {
          arr.push({...doc.data(), waifuId: doc.id});
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
      var fromWaifus = waifus.filter(y => trade.from.waifus.includes(y.waifuId))
      var toWaifus = waifus.filter(y => trade.to.waifus.includes(y.waifuId))

      trade.from.waifus = fromWaifus;
      trade.to.waifus = toWaifus;

      trades.push(trade)
    })

    store.dispatch({
      type: SET_TRADES,
      payload: trades
    });
  });
  
  var unSubWaifus = firebase.firestore().collection("waifus").onSnapshot(async function(querySnapshot) {
    var waifus = [];
    querySnapshot.forEach(function(doc) {
      waifus.push({...doc.data(), waifuId: doc.id})
    });

    store.dispatch({ type: SET_WAIFU_LIST, payload: waifus });

    var userInfo = store.getState().user.credentials;
    var userWaifus = waifus.filter(x => x.husbandoId == userInfo.userId).map(x => x.waifuId);

    store.dispatch({
      type: SET_USER,
      payload: {credentials: userInfo, waifus: userWaifus}
    });
  });

  var unSubPollWaifus = firebase.firestore().collection("waifuPoll").onSnapshot(async function(querySnapshot) {
    var poll = {
      weekly: [],
      daily: [],
    };
    try{
      var userList = await firebase.firestore().collection('users').get()
      .then((users) => {
        var templist = [];
        
        users.forEach((user) => {
          templist.push({ userId: user.id, userName: user.data().userName })
        })
  
        return templist
      })
      .catch((err) => {
        console.log(err)
      })
      
      querySnapshot.forEach(function(doc) {
        var waifu = doc.data();

        waifu.votes.forEach((vote) => {
          var user = userList.filter(x => x.userId == vote.husbandoId)[0].userName
          vote.husbando = user;
        })

        switch(waifu.husbandoId){
          case "Weekly":
            if(waifu.appearDate.toDate() <= new Date())
              poll.weekly.push({...waifu, waifuId: doc.id})
            break;
          case "Daily":
            poll.daily.push({...waifu, waifuId: doc.id})
            break;
        }
      });
      
      //order weeklies by appearDate
      poll.weekly = _.orderBy(poll.weekly,['appearDate'], ['asc'])
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
    // store.dispatch({ type: STOP_LOADING_UI });
  });
  
  var unSubWeeklyPoll = firebase.firestore().doc("poll/weekly").onSnapshot(function(doc) {
    try{
      var pollObj = {...doc.data(), type: "weekly"};
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
    // store.dispatch({ type: STOP_LOADING_UI });
  });
  
  var unSubDailyPoll = firebase.firestore().doc("poll/daily").onSnapshot(function(doc) {
    try{
      var pollObj = {...doc.data(), type: "daily"};

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
    // store.dispatch({ type: STOP_LOADING_UI });
  });
  
  var unSubGauntlet = firebase.firestore().collection("gauntlet")
  .onSnapshot(function(querySnapshot) {
    try{
      var bosses = [];
      querySnapshot.forEach(function(doc) {
        var boss = doc.data();
        var now = firebase.firestore.Timestamp.now().toDate()

        if(boss.appearTime.toDate() <= now && now <= boss.leaveTime.toDate()){
          bosses.push({bossId: doc.id , ...boss});
        }
      });

      bosses = _.orderBy(bosses,['appearTime'], ['asc'])
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
    store.dispatch({ type: STOP_LOADING_UI });
    store.dispatch({ type: STOP_LOADING_DATA });
  });
  
  var unSubChats = firebase.firestore().collection("chats").where("users", 'array-contains', userId).onSnapshot(function(querySnapshot) {
    try{
      var chats = [];
      querySnapshot.forEach(function(doc) {
        chats.push({chatId: doc.id , ...doc.data()});
      });

      chats.forEach(chat => {
        var messages = [];
        chat.messages.map(message => {
          var msg = _.cloneDeep(message)
          var decodedMsg = lz.decompressFromUTF16(msg);
          var parsedMsg = JSON.parse(decodedMsg)
          messages.push(parsedMsg)
        });

        chat.messages = messages;
      })

      store.dispatch({
        type: SET_CHATS,
        payload: chats
      });
    }
    catch(err){
      console.log(err);
      store.dispatch({
        type: SET_CHATS,
        payload: []
      });
    }

    store.dispatch({ type: STOP_LOADING_UI });
  });

  store.dispatch({ type: SUB_SNAPSHOTS, payload: {unSubUser, unSubOtherUsers, unSubWaifus, unSubPollWaifus, unSubDailyPoll, unSubWeeklyPoll, unSubTrades, unSubGauntlet, unSubChats} })
}

async function buildBossRewardStr(reward){
  var result = "Boss Defeated! Rewards Gained";
  var rewards = _.keys(reward);
  var uid = await firebase.auth().currentUser.uid;
  var user = await firebase.firestore().doc(`users/${uid}`).get()

  rewards.forEach(async x => {
    switch(x){
      case "points":
        // result += `\n ${reward[x]} Points`
        await user.ref.update({points: user.data().points + reward[x]})
        /*store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message:  `${reward[x]} Points Added` }]
        }); */
        break;
      case "statCoins":
        // result += `\n ${reward[x]} Stat Coins`
        await user.ref.update({statCoins: user.data().statCoins + reward[x]})
        /*store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message: `${reward[x]} Stat Coins Added` }]
        }); */
        break;
      case "rankCoins":
        // result += `\n ${reward[x]} Rank Coins`
        await user.ref.update({rankCoins: user.data().rankCoins + reward[x]})
        /*store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message: `${reward[x]} Rank Coins Added` }]
        }); */
        break;
    }
  })

  return result;
}
  
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandWaifu(characters){
  let randChanceList = _.fill(Array(50), 1,).concat(_.fill(Array(25), 2)).concat(_.fill(Array(25), 3));
  let randItem = shuffle(randChanceList)[Math.floor(Math.random() * randChanceList.length)]

  let charSet = []
  switch(randItem){
    case 1:
      charSet = characters['Anime-Manga'].items
      break;
    case 2:
      charSet = characters['Marvel'].items
      break;
    case 3:
      charSet = characters['DC'].items
      break;
  }

  return shuffle(charSet)[Math.floor(Math.random() * charSet.length)]
}

export function getBaseStats(rank){
	var stats = { rank, attack: 1, defense: 1}
	switch (rank){
		case 1:
			stats.attack = 3;
			stats.defense = 1;
			break;
		case 2:
			stats.attack = 7;
			stats.defense = 5;
			break;
		case 3:
			stats.attack = 12;
			stats.defense = 10;
			break;
		case 4:
			stats.attack = 20;
			stats.defense = 15;
			break;
	}
	return stats;
}