import template from './login.html';

class LoginCtrl {
  /** @ngInject */
  constructor($http, $interval, AuthenticationSharedService, configuration) {
    this._http = $http;
    this._interval = $interval;
    this._auth = AuthenticationSharedService;
    this._cfg = configuration;
  }

  $onInit() {
    this.ping = this._interval(() => {
      this._http({
        method: 'GET',
        url: `${this._cfg.engineUrl()}/api/ping/`,
        transformResponse: []
      }).then(() => {
        this.stopPing();
      }, () => {
        this.failed = true;
      });
    }, 5000);
  }

  stopPing() {
    if (this.ping) {
      this._interval.cancel(this.ping);
      delete this.ping;
      delete this.failed;
    }
  }

  login() {
    this._auth.login(this.username, this.password);
  }

  logout() {
    this._auth.logout();
  }

  $onDestroy() {
    this.stopPing();
  }
}

export const loginView = {
  template,
  controller: LoginCtrl
};

