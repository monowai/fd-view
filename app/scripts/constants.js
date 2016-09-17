/*
 *
 *  Copyright (c) 2012-2016 "FlockData LLC"
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

'use strict';

/* Constants */

fdView.constant('USER_ROLES',
  {
    all: '*',
    admin: 'ROLE_FD_ADMIN',
    user: 'ROLE_FD_USER'
  })
  .filter('contains', function() {
    return function (array, element) {
      return array.indexOf(element) > -1;
    };
  })
  .filter('notEmpty', function () {
    return function (obj) {
      return !_.isEmpty(obj);
    }
  })
  .filter('megaNum', function () {
    return function(number, fractionSize) {

      if(number === null) return null;
      if(number === 0) return "0";

      if(!fractionSize || fractionSize < 0)
        fractionSize = 1;

      var abs = Math.abs(number);
      var rounder = Math.pow(10,fractionSize);
      var isNegative = number < 0;
      var key = '';
      var powers = [
        {key: "Q", value: Math.pow(10,15)},
        {key: "T", value: Math.pow(10,12)},
        {key: "B", value: Math.pow(10,9)},
        {key: "M", value: Math.pow(10,6)},
        {key: "k", value: 1000}
      ];

      for(var i = 0; i < powers.length; i++) {

        var reduced = abs / powers[i].value;

        reduced = Math.round(reduced * rounder) / rounder;

        if(reduced >= 1){
          abs = reduced;
          key = powers[i].key;
          break;
        }
      }

      return (isNegative ? '-' : '') + abs + key;
    };
  });
