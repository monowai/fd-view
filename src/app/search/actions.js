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

export const searchTermSuccess = results => ({
  type: SEARCH_TERM_SUCCESS,
  data: {...results} // {results, total} returned from service
});

export const searchTermFail = error => ({
  type: SEARCH_TERM_FAIL,
  error
});

export const runTermSearch = searchConfig => {
  const {searchText, fortress, types, from, filter} = searchConfig;
  return dispatch => {
    dispatch(searchTerm());
    const EntityService = getAngularService(document, 'EntityService');

    return EntityService.search(searchText, fortress, types, from, filter).then(response => {
      dispatch(searchTermSuccess(response));
    }).catch(error => {
      dispatch(searchTermFail(error));
    });
  };
};
