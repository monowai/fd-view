export default class Entity {
  /** @ngInject */
  constructor($http, configuration) {
    this._http = $http;
    this._cfg = configuration;
  }

  search(searchText, fortress, types, from, filter) {
    const dataParam = {searchText, fortress, types, from, filter};
    const url = `${this._cfg.engineUrl()}/api/v1/query/`;
    return this._http.post(url, dataParam).then(res => {
      return {results: res.data.results, total: res.data.totalHits};
    });
  }

  getLogsForEntity(entityKey) {
    const url = `${this._cfg.engineUrl()}/api/v1/entity/${entityKey}/summary`;
    return this._http.get(url).then(res => res.data);
  }

  getJsonContentForLog(entityKey, logId) {
    const url = `${this._cfg.engineUrl()}/api/v1/entity/${entityKey}/log/${logId}/data`;
  // This endpoint only ever returns JSON type data
    return this._http.get(url).then(res => res.data);
  }

  getJsonAttachmentForLog(entityKey, logId) {
    const url = `${this._cfg.engineUrl()}/api/v1/entity/${entityKey}/log/${logId}/attachment`;
  // Content for this EP is variable - PDF, XLS, PPT etc. Can be found from the Log
    return this._http.get(url).then(res => res.data);
  }

  getTagsForEntity(entityKey) {
    const url = `${this._cfg.engineUrl()}/api/v1/entity/${entityKey}/tags`;
    return this._http.get(url).then(res => res.data);
  }

  getEntityPK(entityKey) {
    const url = `${this._cfg.engineUrl()}/api/v1/entity/${entityKey}`;
    return this._http.get(url).then(res => res.data.id);
  }
}
