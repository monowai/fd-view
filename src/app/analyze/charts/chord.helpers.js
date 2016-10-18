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

// *******************************************************************
//  CHORD MAPPER
// *******************************************************************
class ChordMpr {
  constructor(data) {
    this.data = data;
    this.mmap = {};
    this.n = 0;
    this.matrix = [];
  }

  setFilter(fun) {
    this.filter = fun;
    return this;
  }

  setAccessor(fun) {
    this.accessor = fun;
    return this;
  }

  getMatrix() {
    const matrix = [];
    _.each(this.mmap, a => {
      if (!matrix[a.id]) {
        matrix[a.id] = [];
      }
      _.each(this.mmap, b => {
        const recs = _.filter(this.data, row => this.filter(row, a, b));
        matrix[a.id][b.id] = this.accessor(recs, a, b);
      });
    });
    this.matrix = matrix;
    return matrix;
  }

  getMap() {
    return this.mmap;
  }

  // printMatrix() {
  //   _.each(this.matrix, elem => console.log(elem));
  // }

  addToMap(value, info) {
    if (!this.mmap[value]) {
      this.mmap[value] = {name: value, id: this.n++, data: info};
    }
  }

  addValuesToMap(varName, info) {
    const values = _.uniq(_.map(this.data, varName));
    _.map(values, v => {
      if (!this.mmap[v]) {
        this.mmap[v] = {name: v, id: this.n++, data: info};
      }
    });
    return this;
  }
}
// *******************************************************************
//  CHORD Reader
// *******************************************************************
function chordRdr(matrix, mmap) {
  return d => {
    const m = {};
    if (d.source) {
      const i = d.source.index;
      const j = d.target.index;
      const s = _.where(mmap, {id: i});
      const t = _.where(mmap, {id: j});
      m.sname = s[0].name;
      m.sdata = d.source.value;
      m.svalue = Number(d.source.value);
      m.stotal = _.reduce(matrix[i], (k, n) => k + n, 0);
      m.tname = t[0].name;
      m.tdata = d.target.value;
      m.tvalue = Number(d.target.value);
      m.ttotal = _.reduce(matrix[j], (k, n) => k + n, 0);
    } else {
      const g = _.where(mmap, {id: d.index});
      m.gname = g[0].name;
      m.gdata = g[0].data;
      m.gvalue = d.value;
    }
    m.mtotal = _.reduce(matrix, (m1, n1) => {
      return m1 + _.reduce(n1, (m2, n2) => m2 + n2, 0);
    }, 0);
    return m;
  };
}

// *******************************************************************
//  CHORD Constructor
// *******************************************************************
function constructChordData(data) {
  if (data) {
    const mpr = new ChordMpr(data);

    mpr.addValuesToMap('source')
      .addValuesToMap('target')
      .setFilter((row, a, b) => (row.source === a.name && row.target === b.name))
      .setAccessor((recs, a, b) => {
        return recs[0] ? Number(recs[0].count) : 0;
      });
    return {matrix: mpr.getMatrix(), mmap: mpr.getMap()};
  }
}
