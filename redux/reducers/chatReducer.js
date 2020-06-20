import _ from 'lodash'
import {
  SET_CHATS,
  SET_LAST_VIEWED
} from '../types';
  
const initialState = {
  loading: false,
  chats: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CHATS:
      return {
        ...state,
        chats: action.payload
      };
    case SET_LAST_VIEWED:
      var chats = _.cloneDeep(state.chats);
      var chat = chats.filter(x => x.chatId == action.payload.chatId);

      if(_.isEmpty(chat)){
        return{
          ...state
        }
      }
      
      chat = chat[0]
      chat.lastViewed = action.payload.lastViewed;
      return{
        chats
      };
    default:
      return {...state};
  }
}
