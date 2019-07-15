class TagInputCtrl {
  /** @ngInject */
  constructor(QueryService) {
    this._query = QueryService;
  }

  getTags() {
    this._query.general('tag').then(data => {
      this.tags = data;
    });
  }
}

export const tagInput = {
  bindings: {
    model: '=',
    class: '@',
    onSelect: '&'
  },
  controller: TagInputCtrl,
  template: `
      <input type="text" class="form-control {{$ctrl.class}}" placeholder="Label"
             ng-model="$ctrl.model" ng-focus="$ctrl.getTags()" autocomplete="off"
             uib-typeahead="t.label for t in $ctrl.tags | filter:$viewValue" typeahead-on-select="$ctrl.onSelect()">`
};
