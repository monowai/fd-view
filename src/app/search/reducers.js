import _ from 'lodash';

import {SEARCH_TERM, SEARCH_TERM_FAIL, SEARCH_TERM_SUCCESS, SET_TERM} from './actions';

const initialState = {
  term: '',
  index: 0,
  isLoading: false,
  total: 0,
  results: [],
  entities: [],
  filter: {}
};

export default function searchReducer(state = initialState, action) {
  const {type, data} = action;
  switch (type) {
    case SET_TERM:
      return {...initialState, term: data};

    case SEARCH_TERM:
      return {...state, isLoading: true};

    case SEARCH_TERM_SUCCESS: {
      const {results, total} = data;
      _.forEach(results, d => {
        d.resources = [];
        let uniqueList = [];
        _.find(d.fragments, (ele, k) => {
          const uniqueEle = _.difference(_.uniq(ele), uniqueList);
          if (uniqueEle.length > 0) {
            d.resources.push({key: k, value: uniqueEle});
            uniqueList = _.union(uniqueEle, uniqueList);
          }
        });
      });

      return {
        ...state,
        isLoading: false,
        index: state.index + results.length,
        total,
        results,
        entities: state.entities.concat(results)
      };
    }

    case SEARCH_TERM_FAIL:
      return {...state, error: action.error, isLoading: false};

    default:
      return state;
  }
}
