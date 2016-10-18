class StatsCtrl {
  /** @ngInject */
  constructor(QueryService, MatrixRequest) {
    this._query = QueryService;
    this._matrix = MatrixRequest;
  }

  $onInit() {
    this._query.general('fortress')
      .then(data => {
        this.fortresses = data;
      });
  }

  search() {
    this.term = this._matrix.searchText;
  }
}

angular
  .module('fd-view')
  .component('statsView', {
    templateUrl: 'app/statistics/statistics.html',
    controller: StatsCtrl
  });
