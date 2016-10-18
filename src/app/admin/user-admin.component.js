class AdminUserCtrl {
  /** @ngInject */
  constructor(User, $http, $rootScope, modalService, configuration) {
    this.user = User.account;
    this.userInfo = {
      title: 'Profile',
      state: this.user
    };

    this._http = $http;
    this._root = $rootScope;
    this._modal = modalService;
    this._cfg = configuration;
  }

  allowEdit(profile) {
    return profile.userRoles.includes('ROLE_FD_ADMIN') && !profile.apiKey;
  }

  editProfile(profile) {
    this._modal.show({
      templateUrl: 'app/admin/edit-user.modal.html'
    }, {obj: profile, disable: true}).then(res => {
      this._http.post(`${this._cfg.engineUrl()}/api/v1/profiles/`,
        {
          login: res.login,
          name: res.name,
          companyName: res.companyName,
          email: res.email
        })
        .then(response => {
          this._root.$broadcast('event:status-ok', response.statusText);
          Object.assign(profile, response.data);
        });
    });
  }
}

angular
  .module('fd-view')
  .component('adminUser', {
    controller: AdminUserCtrl,
    template: `
        <fd-info-box info="$ctrl.userInfo">
          <button class="btn btn-warning pull-right" ng-click="$ctrl.editProfile($ctrl.user)" ng-show="$ctrl.allowEdit($ctrl.user)">
          Edit</button>
        </fd-info-box>`
  });
