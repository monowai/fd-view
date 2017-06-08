import {getAngularService} from '../services/angular-react-helper';

export const SEARCH_TERM = 'search/SEARCH';
export const SEARCH_TERM_SUCCESS = 'search/SEARCH_SUCCESS';
export const SEARCH_TERM_FAIL = 'search/SEARCH_FAIL';

export const SET_TERM = 'search/SET_TERM';

export const setTerm = term => ({
  type: SET_TERM,
  data: term
});

export const searchTerm = term => ({
  type: SEARCH_TERM
});
