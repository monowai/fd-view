/*
 *
 *  Copyright (c) 2012-2017 "FlockData LLC"
 *
 *  This file is part of FlockData.
 *
 *  FlockData is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  FlockData is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FlockData.  If not, see <http://www.gnu.org/licenses/>.
 */
import template from './settings.html';

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

export const settingsView = {
  template,
  controller: SettingsCtrl
};
