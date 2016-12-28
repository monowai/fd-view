class SettingsCtrl {
  /** @ngInject */
  constructor($http, configuration, User) {
    this.setting = {};
    this._cfg = configuration;
    this.authenticated = () => User.authenticated;
    $http.get(`${this._cfg.engineUrl()}/api/v1/admin/health`)
      .then(res => {
        this.fdVersion = res.data['fd.version'];
      });
  }

  apply() {
    this._cfg.setEngineUrl(this.setting.fdEngineUrl);
    this._cfg.setDevMode(this.setting.devMode);
    this.applyResult = true;
  }

  clear() {
    this._cfg.setEngineUrl('');
    this.fdVersion = '';
    this.setting = {};
  }

  init() {
    this.setting.fdEngineUrl = this._cfg.engineUrl();
    this.setting.devModeChecked = this._cfg.devMode();
  }
}

angular
  .module('fd-view')
  .controller('SettingsCtrl', SettingsCtrl);
