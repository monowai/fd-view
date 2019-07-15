import {combineReducers} from 'redux';
import searchReducer from '../search/reducers';
import entityReducer from '../search/viewEntity/reducer';

import {LOAD_PROVIDERS, LOAD_TYPES, SELECT_PPOVIDER, SELECT_TYPES} from './actions';

const initialState = {
  fortress: [],
  fortresses: [],
  types: [],
  typesSelected: [],
  isLoading: false
};

function providerReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROVIDERS:
      if (action.status === 'success') {
        return {
          ...state,
          fortresses: action.data,
          types: [],
          typesSelected: [],
          isLoading: false
        };
      } else if (action.status === 'error') {
        return {...state, isLoading: false, error: action.error};
      }
      return {...state, isLoading: true};

    case SELECT_PPOVIDER: {
      let fortress = action.data;
      if (typeof fortress === 'string') {
        // eslint-disable-line angular/typecheck-string
        fortress = [state.fortresses.find(f => f.name === fortress)];
      }
      return {...state, fortress};
    }
    case LOAD_TYPES:
      if (action.status === 'success') {
        return {...state, types: action.data, isLoading: false};
      } else if (action.state === 'error') {
        return {...state, isLoading: false, error: action.error};
      }
      return {...state, isLoading: true};
    case SELECT_TYPES:
      return {...state, typesSelected: action.data};
    default:
      return state;
  }
}

export default combineReducers({
  provider: providerReducer,
  search: searchReducer,
  entity: entityReducer
});
