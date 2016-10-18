class MatrixRequest {
  /** @ngInject */
  constructor($http, $q, configuration) {
    this._http = $http;
    this._q = $q;
    this._cfg = configuration;

    this._lastMatrixQuery = {};
    this._lastMatrixResult = {};

    this.minCount = 1;
    this.resultSize = 1000;
    this.sharedRlxChecked = false;
    this.reciprocalExcludedChecked = true;
    this.sumByCountChecked = true;
    this.devMode = configuration.devMode(); // 'true';
    this.aggTypes = {
      _count: 'Count', avg: 'Average', sum: 'Sum',
      percentiles: 'Median', min: 'Min', max: 'Max'
    };
  }

  matrixSearch() {
    if (this.sharedRlxChecked) {
      this.toRlx = this.fromRlx;
    }
    const dataParam = {
      documents: this.document,
      sampleSize: this.resultSize,
      fortresses: this.fortress,
      sumByCol: !this.sumByCountChecked,
      queryString: this.searchText,
      concepts: this.concept,
      fromRlxs: this.fromRlx,
      toRlxs: this.toRlx,
      minCount: this.minCount,
      reciprocalExcluded: this.reciprocalExcludedChecked,
      byKey: true
    };
    if (angular.equals(dataParam, this._lastMatrixQuery)) {
      const deferred = this._q.defer();
      deferred.resolve(this._lastMatrixResult);
      return deferred.promise;
    }

    this._lastMatrixQuery = angular.copy(dataParam);
    return this._http.post(`${this._cfg.engineUrl()}/api/v1/query/matrix/`, dataParam)
      .then(res => {
        this._lastMatrixResult = angular.copy(res.data);
        this._lastMatrixResult.matrix = _.map(this._lastMatrixResult.edges, edge => {
          return {
            count: edge.data.count,
            source: _.find(this._lastMatrixResult.nodes, node => {
              return node.data.id === edge.data.source;
            }).data.name,
            target: _.find(this._lastMatrixResult.nodes, node => {
              return node.data.id === edge.data.target;
            }).data.name
          };
        });
        return this._lastMatrixResult;
      });
  }

  sharedChecked() {
    return this._lastMatrixQuery.toRlxs === this._lastMatrixQuery.fromRlxs;
  }

  reciprocalExcluded() {
    return this._lastMatrixQuery.reciprocalExcluded;
  }

  lastMatrix() {
    return this._lastMatrixResult;
  }
}

angular
  .module('fd-view')
  .service('MatrixRequest', MatrixRequest);
