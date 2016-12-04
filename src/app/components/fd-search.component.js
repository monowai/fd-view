class FdSearchCtrl {
  /** @ngInject */
  constructor(MatrixRequest) {
    this.req = MatrixRequest;
  }
}

angular
  .module('fd-view')
  .component('fdSearch', {
    transclude: true,
    template: `
        <form id="search-form" class="panel" ng-submit="$ctrl.search()">
          <div class="input-group">
            <input type="search" class="form-control" placeholder="Text to search for ..." ng-model="$ctrl.req.searchText"
                   size="100" autocomplete="on" autofocus/>
            <div class="input-group-btn">
              <button type="submit" class="btn btn-primary">
              <i class="fa fa-search"></i> View
              </button>
            </div>
          </div>
          <div class="row" ng-transclude></div>
        </form>`,
    controller: FdSearchCtrl,
    bindings: {
      search: '&'
    }
  });
