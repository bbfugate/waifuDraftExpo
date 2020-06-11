import {
  SET_MESSAGES
} from '../types';
  
  const initialState = {
    loading: false,
    chats: []
  };
 
  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_MESSAGES:
        return {
          ...state,
          chats: action.payload
        };
      default:
        return {...state};
    }
  }
  