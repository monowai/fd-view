class ValidateTabCtrl {
  /** @ngInject */
  constructor(modalService, EditColdefModal) {
    this._modal = modalService;
    this._edit = EditColdefModal;
  }

  showResult(rowIndex) {
    this._modal.show(
      {
        template: require('./valid-res-modal.html')
      },
      {
        entry: this.result.rows[rowIndex]._entry
      }
    );
  }

  showValidMsg(rowIndex) {
    this._modal.show(
      {
        template: require('./valid-msg-modal.html')
      },
      {
        msgs: this.result.rows[rowIndex]._messages
      }
    );
  }

  showColDef(key, options) {
    this._edit.display(key, options);
  }
}

export const validateTab = {
  bindings: {
    result: '<'
  },
  controller: ValidateTabCtrl,
  template: `
      <div class="hscroll-table fader" ng-if="$ctrl.result">
        <div ag-grid="$ctrl.result.valGridOptions" class="ag-blue" ng-height="200"></div>
      </div>`
};
