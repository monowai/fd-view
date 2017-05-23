import template from './footer.html';

class Footer {
  /** @ngInject */
  constructor($http, configuration) {
    this.server = configuration.engineUrl();
    $http.get(`${configuration.engineUrl()}/api/v1/admin/health`)
      .then(res => {
        this.fdVersion = res.data['fd.version'];
      });
  }
}

export const infoFooter = {
  template,
  controller: Footer
};
