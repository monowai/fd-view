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

class FdSearchCtrl {
  /** @ngInject */
  constructor(MatrixRequest) {
    this.req = MatrixRequest;
  }
}

export const fdSearch = {
  transclude: true,
  template: `
        <form id="search-form" class="panel" ng-submit="$ctrl.search()">
          <div class="input-group">
            <input type="search" class="form-control" placeholder="Text to search for ..." ng-model="$ctrl.req.searchText"
                   size="100" autocomplete="on" autofocus/>
            <div class="input-group-btn">
              <button type="submit" class="btn btn-primary">
              <i class="fa fa-search"></i> View
              </button>
            </div>
          </div>
          <div class="row" ng-transclude></div>
        </form>`,
  controller: FdSearchCtrl,
  bindings: {
    search: '&'
  }
};
