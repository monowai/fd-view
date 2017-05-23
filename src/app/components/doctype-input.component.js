class DoctypeInputCtrl {
  /** @ngInject */
  constructor(QueryService) {
    this._query = QueryService;
  }

  getDoctypes() {
    if (this.fortress) {
      this._query.doc(this.fortress).then(data => {
        this.documents = data;
      });
    }
  }
}

export const doctypeInput = {
  bindings: {
    model: '=',
    class: '@',
    fortress: '=',
    onSelect: '&',
    ngRequired: '<'
  },
  controller: DoctypeInputCtrl,
  template: `
      <input type="text" class="form-control {{$ctrl.class}}" placeholder="Document Type"
             ng-model="$ctrl.model" ng-focus="$ctrl.getDoctypes()" ng-required="$ctrl.ngRequired"
             uib-typeahead="d.name for d in $ctrl.documents | filter:$viewValue" typeahead-on-select="$ctrl.onSelect()">`
};
