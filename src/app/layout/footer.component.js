class Footer {
  /** @ngInject */
  constructor($http, configuration) {
    this.server = configuration.engineUrl();
    $http.get(`${configuration.engineUrl()}/api/v1/admin/health`)
      .then(res => {
        this.fdVersion = res.data['fd.version'];
      });
    /* Page height fix */
    $.AdminLTE.layout.fix();
  }
}

angular
  .module('fd-view')
  .component('infoFooter', {
    templateUrl: 'app/layout/footer.html',
    controller: Footer
  });

