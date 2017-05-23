class FortressInputCtrl {
  /** @ngInject */
  constructor(QueryService) {
    QueryService.general('fortress').then(data => {
      this.fortresses = data;
    });
  }
}
export const fortressInput = {
  template: `
        <input type="text" class="form-control {{$ctrl.class}}" ng-model="$ctrl.model" placeholder="Optional System" 
               uib-typeahead="f.name as f.name for f in $ctrl.fortresses | filter:$viewValue" ng-required="$ctrl.ngRequired">`,
  controller: FortressInputCtrl,
  bindings: {
    model: '=',
    class: '@',
    ngRequired: '<'
  }
};
