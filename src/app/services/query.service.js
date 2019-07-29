export default class QueryService {
  /** @ngInject */
  constructor($http, configuration) {
    this._http = $http;
    this._cfg = configuration;
  }

  general(queryName) {
    return this._http.get(`${this._cfg.engineUrl()}/api/v1/${queryName}/`).then(res => res.data);
  }

  doc(fortressName, docType) {
    const query = fortressName ? `${fortressName}/${docType ? `${docType}/` : ''}` : '';
    return this._http.get(`${this._cfg.engineUrl()}/api/v1/doc/${query}`).then(res => res.data);
  }

  concept(route, params) {
    return this._http
      .post(`${this._cfg.engineUrl()}/api/v1/concept${route}`, params)
      .then(res => res.data);
  }

  query(queryName, params) {
    return this._http
      .post(`${this._cfg.engineUrl()}/api/v1/query/${queryName}/`, params)
      .then(res => res.data);
  }

  tagCloud(searchText, documents, fortress, tags, relationships) {
    const tagCloudParams = {
      searchText,
      types: documents,
      fortress: fortress[0],
      tags,
      relationships
    };
    return this._http
      .post(`${this._cfg.engineUrl()}/api/v1/query/tagcloud/`, tagCloudParams)
      .then(res => res.data);
  }

  fields(fortress, doctype) {
    return this._http
      .get(`${this._cfg.engineUrl()}/api/v1/model/${fortress}/${doctype}/fields`)
      .then(res => res.data);
  }
}
