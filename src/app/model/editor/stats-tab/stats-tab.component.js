class StatsTab {
  /** @ngInject */
  constructor(DataSample, EditColdefModal) {
    this.totalImport = DataSample.totalImport;
    this._edit = EditColdefModal;
  }

  showColDef(key, options) {
    this._edit.display(key, options);
  }
}

angular
  .module('fd-view.modeler')
  .component('statsTab', {
    bindings: {
      stats: '<',
      model: '<'
    },
    controller: StatsTab,
    templateUrl: 'app/model/editor/stats-tab/stats-tab.html'
  });
