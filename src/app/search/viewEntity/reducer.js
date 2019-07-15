import {LOAD_ENTITY, LOAD_ENTITY_FAIL, LOAD_ENTITY_SUCCESS, SELECT_LOG_SUCCESS} from './actions';

const initialState = {
  entityKey: null,
  details: {},
  delta: null,
  changes: [],
  selected: '',
  isLoading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ENTITY:
      return {...state, isLoading: true};

    case LOAD_ENTITY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        ...action.data,
        selected: action.data.changes[0].id
      };

    case LOAD_ENTITY_FAIL:
      return {
        ...state,
        error: action.error
      };

    case SELECT_LOG_SUCCESS:
      return {
        ...state,
        ...action.data
      };

    default:
      return state;
  }
}
