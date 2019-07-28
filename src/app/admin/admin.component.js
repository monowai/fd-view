import template from './admin.html';

class AdminCtrl {
  /** @ngInject */
  constructor($http, configuration) {
    this.health = { title: 'Health' };
    $http.get(`${configuration.engineUrl()}/api/v1/admin/health`).then(res => {
      this.fdhealth = res.data;
      this.health.state = res.data;
    });
  }
}

export const adminView = {
  template,
  controller: AdminCtrl
};
