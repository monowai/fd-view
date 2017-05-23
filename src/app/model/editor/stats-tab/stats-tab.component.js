import template from './stats-tab.html';
import './stats-tab.scss';

class StatsTabCtrl {
  /** @ngInject */
  constructor(DataSample, EditColdefModal) {
    this.totalImport = DataSample.totalImport;
    this._edit = EditColdefModal;
  }

  showColDef(key, options) {
    this._edit.display(key, options);
  }
}

export const statsTab = {
  bindings: {
    stats: '<',
    model: '<'
  },
  controller: StatsTabCtrl,
  template
};
