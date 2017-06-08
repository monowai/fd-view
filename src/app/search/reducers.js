import {SET_TERM, SEARCH_TERM} from './actions';

const initialState = {
  term: ''
};

export default function searchReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TERM:
      return {...state, term: action.data};
    default:
      return state;
  }
}
