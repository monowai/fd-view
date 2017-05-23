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
import angular from 'angular';
import _ from 'lodash';

import template from './structure-tab.html';
import './structure-tab.scss';

class StructureTabCtrl {
  /** @ngInject */
  constructor(ContentModel, modalService, $timeout, EditColdefModal) {
    this.list = 'Columns';

    this.styles = [
      {
        selector: 'node',
        css: {
          'content': 'data(id)',
          'font-size': '12pt',
          'min-zoomed-font-size': '9pt',
          'text-halign': 'center',
          'text-valign': 'center',
          'color': '#222D32',
          'background-color': '#499ef5',
          'width': '120',
          'height': '55',
          'shape': 'roundrectangle'
        }
      },
      {
        selector: 'node[type="tag"]',
        css: {
          'background-color': '#ff7701',
          'content': 'data(label)',
          'shape': 'ellipse',
          'width': '110',
          'height': '50'
        }
      },
      {
        selector: 'node[type="alias"]',
        css: {
          'background-color': '#f7bf65',
          'content': 'data(code)',
          'shape': 'ellipse',
          'width': '100',
          'height': '45'
        }
      },
      {
        selector: 'edge',
        css: {
          'content': 'data(relationship)',
          'curve-style': 'bezier',
          'width': 5,
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: 'edge[type="geo"]',
        css: {
          'line-color': '#00a65a',
          'target-arrow-color': '#00a65a'
        }
      },
      {
        selector: ':selected',
        css: {
          'background-color': 'f2b871',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black',
          'text-outline-width': 2,
          'text-outline-color': '#888'
          // 'text-outline-color': 'black'
        }
      },
      {
        selector: '.mouseover',
        css: {
          color: '#398de0'
        }
      },
      {
        selector: '.is-dragover',
        css: {
          'background-color': '#398de0'
        }
      }
    ];
    this.layouts = [{name: 'circle'},
      {name: 'cose', randomize: true},
      {name: 'dagre'},
      {name: 'grid'},
      {name: 'concentric'},
      {name: 'random'},
      {name: 'breadthfirst'}];
    this.layout = this.layouts[0];
    this.nodes = [];

    this._cm = ContentModel;
    this._modal = modalService;
    this._timeout = $timeout;
    this._edit = EditColdefModal;
  }

  $onInit() {
    this._timeout(() => {
      this.modelGraph = this._cm.graphModel();
      this.tags = this._cm.getTags();
    }, 100);
  }

  $onChanges(changeObj) {
    if (changeObj.model.currentValue) {
      this.modelGraph = this._cm.graphModel();
    }
  }

  qtip() {
    return this.data().code;
  }

  processDrop() {
    // console.log('Element Dropped..');
  }

  createTag() {
    const canConnect = [{label: 'root', id: 0}].concat(this.tags);
    const tag = true;
    let selected = this.nodes.length ?
      canConnect.find(t => t.id === this.nodes[0]._private.data.id) :
      canConnect[0];

    this._modal.show({
      template: require('./forms/create-tag.html')
    }, {obj: {selected}, canConnect}).then(res => {
      if (res.selected.id === 0) {
        res.tag = true;
        this.model.content[res.name] = res;
      } else {
        selected = this._cm.findTag(res.selected.id);
        selected.targets = selected.targets || [];
        selected.targets.push(res);
      }
      delete res.selected;

      this._cm.updateModel(this.model);
      this.modelGraph = this._cm.graphModel();
      this.tags = this._cm.getTags();
    });
  }

  createColumn() {
    const unique = name => !_.find(Object.keys(this.model.content), k => k === name);

    this._modal.show({
      template: require('./forms/create-column.html')
    }, {unique})
      .then(res => {
        this._cm.addCol(res);
      });
  }

  createEntitylink() {
    this._modal.show({
      template: require('./forms/create-entitylink.html')
    }, {colDefs: Object.keys(this.model.content)})
      .then(res => {
        this._cm.addEntitylink(res.col, _.omit(res, 'col'));
        this.modelGraph = this._cm.graphModel();
      });
  }

  createAlias() {
    const modalOptions = {
      tags: this.tags,
      obj: {
        tag: this.nodes.length ?
          this.tags[this.tags.indexOf(_.find(this.tags, t => t.id === this.nodes[0]._private.data.id))] : ''
      }
    };

    this._modal.show({template: require('./forms/create-alias.html')}, modalOptions)
      .then(res => {
        this._cm.addAlias(res.tag, _.omit(res, 'tag'));
        this.modelGraph = this._cm.graphModel();
      });
  }

  nodeLink(source, target) {
    const cleanTarget = tag => {
      if (tag.entytyTagLinks) {
        delete tag.entityTagLinks;
      }
      if (tag.tag) {
        delete tag.tag;
      }
      if (tag.target || angular.isString(tag.target)) {
        delete tag.target;
      }
      if (tag.dataType) {
        delete tag.dataType;
      }
      if (tag.persistent) {
        delete tag.persistent;
      }
      if (tag.storeNull) {
        delete tag.storeNull;
      }
      return tag;
    };

    if (source.type === 'tag' && target.type === 'tag') {
      this._modal.show({
        template: require('./link-tags.html')
      }, {disable: true, source, target})
        .then(res => {
          const sourceTag = this._cm.findTag(source.id);
          const targetTag = angular.copy(this._cm.findTag(target.id));
          sourceTag.targets = sourceTag.targets || [];
          angular.extend(targetTag, res);
          sourceTag.targets.push(cleanTarget(targetTag));
          this._cm.updateModel(this.model);
          this.modelGraph = this._cm.graphModel();
        });
    } else if (source.type === 'entity' && target.type === 'tag') {
      this.showColDef(target.id, {openAsTag: true, link: source});
    } else {
      this.modelGraph = this._cm.graphModel();
    }
  }

  showColDef(key, options) {
    this._edit.display(key, options).then(() => {
      this.modelGraph = this._cm.graphModel();
      this.tags = this._cm.getTags();
    });
  }
}

export const structureTab = {
  bindings: {
    model: '<'
  },
  controller: StructureTabCtrl,
  template
};
