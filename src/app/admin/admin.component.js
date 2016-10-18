class AdminCtrl {
  /** @ngInject */
  constructor($http, configuration) {
    this.health = {title: 'Health'};
    $http.get(`${configuration.engineUrl()}/api/v1/admin/health`)
      .then(res => {
        this.fdhealth = res.data;
        this.health.state = res.data;
      });
  }
}

angular
  .module('fd-view')
  .component('adminView', {
    templateUrl: 'app/admin/admin.html',
    controller: AdminCtrl
  });
