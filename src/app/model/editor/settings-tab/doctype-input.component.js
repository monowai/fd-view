class DoctypeInput {
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

angular
  .module('fd-view.modeler')
  .component('doctypeInput', {
    bindings: {
      model: '=',
      class: '@',
      fortress: '=',
      onSelect: '&'
    },
    controller: DoctypeInput,
    template: `
      <input type="text" class="form-control {{$ctrl.class}}" placeholder="Document Type" \
             ng-model="$ctrl.model" ng-focus="$ctrl.getDoctypes()" \
             uib-typeahead="d.name for d in $ctrl.documents | filter:$viewValue" typeahead-on-select="$ctrl.onSelect()">`
  });
