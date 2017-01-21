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

class ViewEntityCtrl {
  /** @ngInject */
  constructor($stateParams, EntityService, configuration, $window) {
    this.entityKey = $stateParams.entityKey;
    this.metaHeader = {};
    this.log = {};
    this.tags = [];

    this.log1 = {};
    this.log2 = {};

    this.selectedLog = [];

    this.showUnchangedFlag = false;

    this._entity = EntityService;
    this._conf = configuration;
    this._window = $window;
  }

  init() {
    this._entity.getLogsForEntity(this.entityKey).then(data => {
      this.metaHeader = data;
      // console.log(data);

      if (this.metaHeader.changes[0] !== null) {
        this._entity.getJsonContentForLog(this.entityKey, this.metaHeader.changes[0].id)
          .then(data => {
            this.log = data;
            if (data.src) {
              this.src = data.src.join('\n');
              this.codeOptions = {mode: this.metaHeader.type};
            }
          });
        this.logSelected = this.metaHeader.changes[0].id;
      }

      this._entity.getTagsForEntity(this.entityKey)
        .then(data => {
          this.tags = data;
        });
    });
  }

  showUnchanged() {
    // console.log('showUnchanged : ', this.showUnchangedFlag);
    if (this.showUnchangedFlag) {
      jsondiffpatch.formatters.html.showUnchanged();
    } else {
      jsondiffpatch.formatters.html.hideUnchanged();
    }
  }

  selectAction() {
    // var logId1 = this.logSelected;
    const logId2 = this.myOption;

    // Getting Log2
    this._entity.getJsonContentForLog(this.entityKey, logId2).then(data => {
      this.log2 = data;
      // Log One is already loaded
      this.log1 = this.log;
    });
  }

  openExplore() {
    this._entity.getEntityPK(this.entityKey)
      .then(id => {
        const url = `${this._conf.exploreUrl()}graph.html?id=${id}`;
        this._window.open(url);
      }
    );
  }

  // openPopup , openDeltaPopup , selectLog must not be duplicated
  openPopup(logId) {
    this.logSelected = logId;
    this._entity.getJsonContentForLog(this.entityKey, logId)
      .then(data => {
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
    this._entity.getJsonContentForLog(this.entityKey, logId1)
      .then(data => {
        this.log1 = data;
      });

    // Getting Log2
    this._entity.getJsonContentForLog(this.entityKey, logId2)
      .then(data => {
        this.log2 = data;
      });
  }

  selectLog(logId) {
    if (this.selectedLog.includes(logId)) {
      this.selectedLog.splice(this.selectedLog.indexOf(logId), 1);
    } else {
      this.selectedLog.push(logId);
    }
  }
}

angular
  .module('fd-view')
  .component('viewEntity', {
    templateUrl: 'app/search/viewentity.html',
    controller: ViewEntityCtrl
  });
