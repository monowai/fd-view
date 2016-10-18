class ValidateTab {
  /** @ngInject */
  constructor(modalService, EditColdefModal) {
    this._modal = modalService;
    this._edit = EditColdefModal;
  }

  showResult(rowIndex) {
    this._modal.show({
      templateUrl: 'app/model/editor/validate-tab/valid-res-modal.html'
    }, {
      entry: this.result.rows[rowIndex]._entry
    });
  }

  showValidMsg(rowIndex) {
    this._modal.show({
      templateUrl: 'app/model/editor/validate-tab/valid-msg-modal.html'
    }, {
      msgs: this.result.rows[rowIndex]._messages
    });
  }

  showColDef(key, options) {
    this._edit.display(key, options);
  }
}

angular
  .module('fd-view.modeler')
  .component('validateTab', {
    bindings: {
      result: '<'
    },
    controller: ValidateTab,
    template: `
      <div class="hscroll-table fader" ng-if="$ctrl.result">
        <div ag-grid="$ctrl.result.valGridOptions" class="ag-blue" ng-height="200"></div>
      </div>`
  });
