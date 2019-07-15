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

/**
 * Created by macpro on 09/08/2014.
 */

import template from './viewentity.html';
import {fetchEntity} from './actions';

class ViewEntityCtrl {
  /** @ngInject */
  constructor($stateParams, EntityService, configuration, $window, $ngRedux) {
    this.entityKey = $stateParams.entityKey;
    this.metaHeader = {};

    this._entity = EntityService;
    this._conf = configuration;
    this._window = $window;
    this.ngRedux = $ngRedux;

    this.disconnect = $ngRedux.connect(
      state => ({onLoading: state.onLoading}),
      dispatch => ({
        loadEntity(key) {
          dispatch(fetchEntity(key));
        }
      })
    )(this);
  }

  $onInit() {
    this.loadEntity(this.entityKey);
  }

  $onDestroy() {
    this.disconnect();
  }

  openExplore() {
    this._entity.getEntityPK(this.entityKey).then(id => {
      const url = `${this._conf.exploreUrl()}graph.html?id=${id}`;
      this._window.open(url);
    });
  }

  // openPopup , openDeltaPopup , selectLog must not be duplicated
  openPopup(logId) {
    this.logSelected = logId;
    this._entity.getJsonContentForLog(this.entityKey, logId).then(data => {
      this.log = data;
    });

    // reset Logs DELTA
    this.log1 = {};
    this.log2 = {};
  }

  openDeltaPopup() {
    const logId1 = this.selectedLog[0];
    const logId2 = this.selectedLog[1];

    // Getting Log1
    this._entity.getJsonContentForLog(this.entityKey, logId1).then(data => {
      this.log1 = data;
    });

    // Getting Log2
    this._entity.getJsonContentForLog(this.entityKey, logId2).then(data => {
      this.log2 = data;
    });
  }
}

export const viewEntityView = {
  template,
  controller: ViewEntityCtrl
};
