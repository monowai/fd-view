import {getAngularService} from '../../services/angular-react-helper';

export const LOAD_ENTITY = 'entity/LOAD';
export const LOAD_ENTITY_SUCCESS = 'entity/LOAD_SUCCESS';
export const LOAD_ENTITY_FAIL = 'entity/LOAD_FAIL';
export const SELECT_LOG_SUCCESS = 'entity/SELECT_LOG_SUCCESS';
export const SELECT_LOG_FAIL = 'entity/SELECT_LOG_FAIL';

export const loadEntity = () => ({
  type: LOAD_ENTITY
});

export const loadEntitySuccess = result => ({
  type: LOAD_ENTITY_SUCCESS,
  data: result
});

export const loadEntityFail = error => ({
  type: LOAD_ENTITY_FAIL,
  error
});

export const fetchEntity = entityKey => {
  return async dispatch => {
    dispatch(loadEntity());

    try {
      const EntityService = getAngularService(document, 'EntityService');
      const log = await EntityService.getLogsForEntity(entityKey);
      const details =
        log.changes[0] && (await EntityService.getJsonContentForLog(entityKey, log.changes[0].id));
      // const tags = await EntityService.getTagsForEntity(entityKey);
      dispatch(loadEntitySuccess({...log, details, entityKey}));
    } catch (e) {
      dispatch(loadEntityFail(e));
    }
  };
};

export const selectLogSuccess = result => ({
  type: SELECT_LOG_SUCCESS,
  data: result
});

export const selectLog = id => {
  return async (dispatch, getState) => {
    dispatch(loadEntity());
    try {
      const {entityKey} = getState().reducer.entity;
      const EntityService = getAngularService(document, 'EntityService');
      const details = await EntityService.getJsonContentForLog(entityKey, id);
      dispatch(selectLogSuccess({details, selected: id}));
    } catch (e) {
      dispatch(loadEntityFail(e));
    }
  };
};

export const selectDelta = id => {
  return async (dispatch, getState) => {
    dispatch(loadEntity());
    try {
      const {entityKey} = getState().reducer.entity;
      const EntityService = getAngularService(document, 'EntityService');
      const delta = await EntityService.getJsonContentForLog(entityKey, id);
      dispatch(selectLogSuccess({delta}));
    } catch (e) {
      dispatch(loadEntityFail(e));
    }
  };
};
