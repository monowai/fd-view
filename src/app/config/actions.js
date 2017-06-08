import {getAngularService} from '../services/angular-react-helper';

export const LOAD_PROVIDERS = 'config/LOAD_PROVIDERS';
export const SELECT_PPOVIDER = 'config/SELECT_PPOVIDER';
export const LOAD_TYPES = 'config/LOAD_TYPES';
export const SELECT_TYPES = 'config/SELECT_TYPES';

export const requestProviders = () => {
  return {
    type: LOAD_PROVIDERS
  };
};

export const receiveProviders = fortresses => {
  return {
    type: LOAD_PROVIDERS,
    status: 'success',
    data: fortresses
  };
};

export const requestProvidersFail = error => {
  return {
    type: LOAD_PROVIDERS,
    status: 'error',
    error
  };
};

export const fetchProviders = () => {
  return dispatch => {
    dispatch(requestProviders());
    const QueryService = getAngularService(document, 'QueryService');

    return QueryService.general('fortress').then(fortresses => {
      // need to test with 0 fortresses
      dispatch(receiveProviders(fortresses.length ? fortresses : {name: 'None'}));
    }).catch(error => {
      dispatch(requestProvidersFail(error));
    });
  };
};

export const selectProvider = fortress => {
  return {
    type: SELECT_PPOVIDER,
    data: fortress
  };
};

export const requestTypes = () => {
  return {
    type: LOAD_TYPES
  };
};

export const receiveTypes = types => {
  return {
    type: LOAD_TYPES,
    status: 'success',
    data: types
  };
};

export const requestTypesFail = error => {
  return {
    type: LOAD_TYPES,
    status: 'error',
    error
  };
};

export const fetchTypes = fortress => {
  return dispatch => {
    dispatch(requestTypes());
    const QueryService = getAngularService(document, 'QueryService');

    return QueryService.doc(fortress.code).then(types => {
      dispatch(receiveTypes(types));
    }).catch(error => {
      dispatch(requestTypesFail(error));
    });
  };
};

export const selectTypes = types => {
  return {
    type: SELECT_TYPES,
    data: types
  };
};
