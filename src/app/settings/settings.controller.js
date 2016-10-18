class SettingsCtrl {
  /** @ngInject */
  constructor(configuration, User) {
    this.setting = {};
    this._cfg = configuration;
    this.authenticated = () => User.authenticated;
  }

  apply() {
    this._cfg.setEngineUrl(this.setting.fdEngineUrl);
    this._cfg.setDevMode(this.setting.devMode);
    this.applyResult = true;
  }

  clear() {
    this._cfg.setEngineUrl('');
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
