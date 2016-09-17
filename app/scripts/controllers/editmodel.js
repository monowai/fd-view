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

agGrid.initialiseAgGridWithAngular1(angular);

fdView.controller('EditModelCtrl', ['$scope', '$stateParams', '$window', 'toastr', '$uibModal', 'QueryService', 'ContentModel', '$state', '$http', '$timeout', 'modalService', 'configuration',
  function ($scope, $stateParams, $window, toastr, $uibModal, QueryService, ContentModel, $state, $http, $timeout, modalService, configuration) {

    var originalModel = { content:{} };

    $scope.list = 'Columns';

    $scope.allModels = [];
    $scope.getAllModels = function () {
      return ContentModel.getAll().then(function (res) {
        $scope.allModels = res.data;
        $scope.tagModels = _.filter(res.data, {documentType: 'TagModel'});
      });
    };

    $scope.findModel = function (model) {
      function findModel(model) {
        return _.find($scope.allModels, function (m) {
          if (model.tagModel) {
            return m.code === model.code;
          } else {
            return m.fortress === model.fortress.name && m.documentType === model.documentType.name;
          }
        });
      }

      if ($scope.allModels.length===0) {
        $scope.getAllModels().then(function () {
          $scope.modelToLoad = findModel(model);
        });
      } else {
        $scope.modelToLoad = findModel(model);
      }
    };

    $scope.cleanTagModel = function () {
      if ($scope.contentModel.tagModel) {
        if ($scope.contentModel.fortress) delete $scope.contentModel.fortress;
        if ($scope.contentModel.documentType) delete $scope.contentModel.documentType;
        if ($scope.modelToLoad) delete $scope.modelToLoad;
      }
    };

    $scope.loadModel = function (key) {
      ContentModel.getModel(key).then(function (res) {
        $scope.contentModel = res.data.contentModel;
        $scope.name = $scope.contentModel.code || $scope.contentModel.documentType.name;
        originalModel = angular.copy($scope.contentModel);
        $scope.modelGraph = ContentModel.graphModel();
        $scope.tags = ContentModel.getTags();
        if ($scope.modelGraph.nodes.length === 1) {
          $timeout(function () {
            $scope.$broadcast('cytoscapeFitOne');
          }, 10);
        }
        if (!!$scope.modelToLoad) { delete $scope.modelToLoad}
      });
    };

    if (!$stateParams.modelKey) {
      $scope.model = {};
      $scope.name = 'New model';
      $scope.contentModel = angular.copy(originalModel);
      angular.element('[data-target="#settings"]').tab('show');
    } else {
      $scope.loadModel($stateParams.modelKey);
    }

    $scope.editorOptions = {
      mode: "tree",
      modes: ["tree", "code", "form"],
      expanded: true
    };
    $scope.onEditorLoad = function (instance) {
      $scope.editor = instance;
    };

    var cleanTarget = function (tag) {
      if (tag.entytyTagLinks) delete tag.entityTagLinks;
      if (tag.tag) delete tag.tag;
      if (tag.target || typeof tag.target === 'string') delete tag.target;
      if (tag.dataType) delete tag.dataType;
      if (tag.persistent) delete tag.persistent;
      if (tag.storeNull) delete tag.storeNull;
      return tag;
    };

    $scope.nodeLink = function (source, target) {
      if (source.type==='tag' && target.type==='tag') {
        modalService.show({
          templateUrl: 'link-tags.html'
        },{disable: true, source: source, target: target})
          .then(function (res) {
            var sourceTag = ContentModel.findTag(source.id),
                targetTag = angular.copy(ContentModel.findTag(target.id));
            if (!sourceTag.targets) sourceTag.targets = [];
            angular.extend(targetTag, res);
            sourceTag.targets.push(cleanTarget(targetTag));
            ContentModel.updateModel($scope.contentModel);
            $scope.modelGraph = ContentModel.graphModel();
          });
      } else if (source.type==='entity' && target.type==='tag') {
        $scope.showColDef(target.id, {openAsTag: true, link: source});
      } else {
        $scope.modelGraph = ContentModel.graphModel();
      }
    };

    $scope.saved = function () {
      return angular.equals(originalModel, $scope.contentModel);
    };

    $scope.canSave = function () {
      if ($scope.contentModel) {
        if ($scope.contentModel.fortress && $scope.contentModel.documentType) {
          return true;
        } else if ($scope.contentModel.tagModel && $scope.contentModel.code && $scope.contentModel.name) {
          return true;
        }
      }
      return false;
    };

    $scope.sampleData = function () {
      if ($scope.modelToLoad) $scope.loadModel($scope.modelToLoad.key);
      angular.element('[data-target="#sample"]').tab('show');
    };

    $scope.save = function () {
      var model = $scope.editor.get();
      ContentModel.updateModel(model);
      if ($scope.canSave()) {
        ContentModel.saveModel()
          .success(function (res) {
            toastr.success(res.statusText, 'Success');
            angular.element('[data-target="#structure"]').tab('show');
            $scope.modelGraph = ContentModel.graphModel();
            originalModel = angular.copy(model);
            $scope.tags = ContentModel.getTags();
            $scope.name = $scope.contentModel.code || $scope.contentModel.documentType.name;
            $timeout(function () {
              $scope.$broadcast('cytoscapeReset');
            }, 500);
          })
          .error(function (res) {
            toastr.error(res.message, 'Error');
          });
      } else {
        toastr.warning('Model, cannot be saved. Please check your model configuration!', 'Error');
        angular.element('[data-target="#settings"]').tab('show');
      }
    };

    $scope.updateModel = function () {
      if ($scope.modelToLoad) $scope.loadModel($scope.modelToLoad.key);
      angular.element('[data-target="#structure"]').tab('show');
      if (!angular.equals($scope.model, $scope.contentModel)) {
        ContentModel.updateModel($scope.contentModel);
        $scope.modelGraph = ContentModel.graphModel();
        $scope.tags = ContentModel.getTags();
        $timeout(function () {
          $scope.$broadcast('cytoscapeReset');
        }, 500);
        delete $scope.model;
      }
    };

    $scope.checkModel = function () {
      $scope.model = {};
      angular.copy($scope.contentModel, $scope.model);
      $scope.editor.focus();
      if($scope.editor.getMode()!=='code') $scope.editor.expandAll();
    };

    $scope.styles = [
      {
        'selector': 'node',
        'css': {
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
        'selector': 'node[type="tag"]',
        'css': {
          'background-color': '#ff7701',
          'content': 'data(label)',
          'shape': 'ellipse',
          'width': '110',
          'height': '50'
        }
      },
      {
        'selector': 'node[type="alias"]',
        'css': {
          'background-color': '#f7bf65',
          'content': 'data(code)',
          'shape': 'ellipse',
          'width': '100',
          'height': '45'
        }
      },
      {
        'selector': 'edge',
        'css': {
          'content': 'data(relationship)',
          'width': 5,
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }
      },
      {
        'selector': 'edge[type="geo"]',
        'css': {
          'line-color' : '#00a65a',
          'target-arrow-color': '#00a65a'
        }
      },
      {
        'selector': ':selected',
        'css': {
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
        'selector': '.mouseover',
        'css': {
          'color': '#398de0'
        }
      },
      {
        'selector': '.is-dragover',
        'css': {
          'background-color': '#398de0'
        }
      }
    ];
    $scope.layouts = [{name: 'circle'}, {name: 'cose'},
      {name: 'grid'}, {name: 'concentric'},
      {name: 'random'}, {name: 'breadthfirst'}, {name: 'dagre'}];
    $scope.layout = $scope.layouts[0];
    $scope.nodes = [];
    $scope.qtip = function () { return this.data().code; };

    $scope.processDrop = function () {
      console.log('Element Dropped..');
    };

    $scope.createTag = function () {
      var selected = 'root';
      if ($scope.nodes.length>0)
        selected = ContentModel.findTag($scope.nodes[0]._private.data.id);

      $uibModal.open({
        templateUrl: 'create-tag.html',
        resolve: {
          tags: function () {
            return $scope.tags;
          },
          active: function () {
            return selected;
          }
        },
        controller: ['$scope','$uibModalInstance','tags','active', function ($scope,$uibModalInstance,tags,active) {
          $scope.elem = {};
          if (active === 'root') {
            $scope.elem.tag = true;
          }
          $scope.active = active.name || active.label || active;// || active.dataType.name;
          $scope.canConnect = [{label: 'root', id:0}];
          _.each(tags, function (t) {
            $scope.canConnect.push(t);
          });

          $scope.cancel = $uibModalInstance.dismiss;
          $scope.ok = function (isValid) {
            if (isValid) {
              $uibModalInstance.close($scope.elem, $scope.active);
            }
          };
        }]
      }).result.then(function (res) {
        if(selected==='root') {
          $scope.contentModel.content[res.name] = res;
        } else {
          if(!selected.targets) {
            selected.targets = [];
          }
          selected.targets.push(res);
        }
        ContentModel.updateModel($scope.contentModel);
        $scope.modelGraph = ContentModel.graphModel();
        $scope.tags = ContentModel.getTags();
      });
    };

    $scope.createColumn = function () {
      var modalDefaults = {
        templateUrl: 'create-column.html',
        resolve: {
          colDefs: function () {
            return Object.keys($scope.contentModel.content);
          }
        },
        controller: ['$scope', '$uibModalInstance', 'colDefs', function ($scope, $uibModalInstance, colDefs) {
          $scope.unique = function (name) {
            return !_.any(colDefs, function (o) {
              return o.name===name;
            });
          };
          $scope.ok = function (res) {
            $uibModalInstance.close(res);
          };
          $scope.close = $uibModalInstance.dismiss;
        }]
      };

      modalService.showModal(modalDefaults).then(function (res) {
        ContentModel.addCol(res);
      });
    };

    $scope.createEntitylink = function () {
      var modalDefaults = {
        templateUrl: 'create-entitylink.html',
        resolve: {
          colDefs: function () {
            return Object.keys($scope.contentModel.content);
          }
        },
        controller: ['$scope', '$uibModalInstance', 'colDefs', function ($scope, $uibModalInstance, colDefs) {
          $scope.colDefs = colDefs;
          $scope.ok = function (res) {
            $uibModalInstance.close(res);
          };
          $scope.close = $uibModalInstance.dismiss;
        }]
      };

      modalService.showModal(modalDefaults).then(function (res) {
        ContentModel.addEntitylink(res.col, _.omit(res, 'col'));
        $scope.modelGraph = ContentModel.graphModel();
      });
    };

    $scope.createAlias = function () {
      var modalDefaults = {
        templateUrl: 'create-alias.html',
        resolve: {
          tags: function () {
            return $scope.tags;
          },
          active: function () {
            if ($scope.nodes.length>0)
              return _.find($scope.tags, function (t) {
                return t.id===$scope.nodes[0]._private.data.id;
              });
            else return undefined;
          }
        },
        controller: ['$scope', '$uibModalInstance', 'tags', 'active', function ($scope, $uibModalInstance, tags, active) {
          $scope.tags = tags;
          if (active) {
            $scope.obj = {tag: $scope.tags[$scope.tags.indexOf(active)]};
          }
          $scope.ok = function (res) {
            $uibModalInstance.close(res);
          };
          $scope.close = $uibModalInstance.dismiss;
        }]
      };

      modalService.showModal(modalDefaults).then(function (res) {
        ContentModel.addAlias(res.tag, _.omit(res, 'tag'));
        $scope.modelGraph = ContentModel.graphModel();
      });
    };

    $scope.showColDef = function (key, options) {
      var cp = ContentModel.getCurrent(),
          col = {},
          tag;

      var options = options || {openAsTag: false};
      if (options.openAsTag) {
        var t = ContentModel.findTag(key);
        col[t.label] = t;
        col.options = options;
      } else {
        col = _.pick(cp.content, key);
      }
      tag = t || col[key];
      $uibModal.open({
        backdrop: 'static',
        templateUrl: 'edit-coldef.html',
        size: 'lg',
        controller: 'EditColdefCtrl',
        resolve: {
          coldef: function () {
            return col;
          },
          tags: function () {
            return $scope.tags;
          }
        }
      }).result.then(function (res) {
        if (res.$$id) {
          _.each(cp.content, function (cd) {
            function checkAndUpdate(tag) {
              if (tag.$$id === res.$$id) {
                return _.extend(tag, res);
              }
              if (tag.targets) _.each(tag.targets, function (t) {
                checkAndUpdate(t);
              })
            }
            if (cd.tag) {
              checkAndUpdate(cd);
            }
          });

        } else {
          cp.content[key] = res;
        }

        if (!!res.$$alias) {
          var atag = ContentModel.findTag(res.$$alias.tag);
          if (!atag.aliases) atag.aliases = [];
          var alias = _.omit(res.$$alias, 'tag');
          if (_.findWhere(atag.aliases, alias)===undefined)
            atag.aliases.push(alias);
        }

        ContentModel.updateModel(cp);
        $scope.contentModel = cp;
        $scope.modelGraph = ContentModel.graphModel();
        $scope.tags = ContentModel.getTags();
      });
    };

    $scope.hasHeader=true;

    $scope.previouslyLoaded = $window.localStorage.hasOwnProperty('import-data');

    $scope.loadPrevious = function () {
      var data = JSON.parse($window.localStorage.getItem('import-data'));
      data.columns = JSON.parse($window.localStorage.getItem('import-data-cols'));
      setGrid(data);
    };

    var setGrid = function (data) {
      $scope.dataSample = data.slice(0,200);
      $scope.dataSample.totalImport = data.length;
      $scope.gridOptions = {
        columnDefs: _.map(data.columns, function (k) {
          return {field: k, headerName: k, editable: true, headerClass: function () {
            var obj = $scope.contentModel.content[k];
            if (obj) {
              if (obj.tag)
                return 'tag';
              if (obj.$$alias)
                return 'alias';
              if (obj.callerRef)
                return 'bg-green';
              if (!obj.persistent)
                return 'dim';
            }
          }};
        }),
        rowData: $scope.dataSample,
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        rowSelection: 'multiple',
        angularCompileHeaders: true,
        headerCellRenderer: function (params) {
          params.$scope.editColDef = $scope.showColDef;

          var eCell = document.createElement('span');
          eCell.innerHTML = '<span class="ag-click-ico" ng-click="showColDef(\''+params.colDef.headerName+'\', {})"><i class="fa fa-edit"></i></span>&nbsp;'+params.colDef.headerName;
          return eCell;
        }
      };
      ContentModel.updateModel($scope.contentModel);
      ContentModel.getDefault({rows: $scope.dataSample}).success(function (res) {
        toastr.success('Data is loaded', 'Success');
        $scope.model = {};
        $scope.contentModel = res;
        $scope.modelGraph = ContentModel.graphModel();
        $scope.tags = ContentModel.getTags();
        $scope.dataStats = $scope.buildStats(data, res.content);
      }).error(function (res) {
        toastr.error(res, 'Error');
      });
    };

    $scope.loadFile = function(fileContent, fileName, delim){
      var data=[];
      if (fileContent) {
        var lines = fileContent.match(/[^\r\n]+/g);
        var i = 0;
        while (lines[i].match(/^#.*/)) {
          lines[i]='';
          i++;
        }
        var clean = lines.join('\n').trim();

        data = d3.dsvFormat(delim==='\\t' ? '\t' : delim).parse(clean, function (d) {
          return _.forIn(d, function (v, k) {
            if(/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i.test(v)) // /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
              d[k] = Number(v);
          });
        });
        $window.localStorage.setItem('import-data', JSON.stringify(data));
        $window.localStorage.setItem('import-data-cols', JSON.stringify(data.columns));
        $scope.previouslyLoaded = $window.localStorage.hasOwnProperty('import-data');
      } else {
        toastr.warning('File is not loaded', 'Warning');
      }
      setGrid(data);
    };

    $scope.buildStats = function (sample, model) {
      return _(sample.columns)
        .map(function (c) {
          var col = {
              type: model[c].dataType,
              missing: _(sample)
                .map(c)
                .filter(function (d) { return d===''; })
                .pairs()
                .value()
                .length
            },
            o = {};
          if (model[c].callerRef) {
            o[c] = col;
          }
          if (model[c].tag || col.type==='string') {
            var count = _(sample)
              .map(c)
              .countBy()
              .omit('')
              .pairs()
              .sortByOrder(_.last, 'desc')
              .value();
            o[c] = Object.assign(col,{stats:{
              unique: count.length,
              least: _.last(count),
              most: _.first(count),
              values: count
            }});
          }
          if (col.type==='number' || col.type==='date') {
            if (!model[c].callerRef) {
              o[c] = Object.assign(col,{stats: {
                min: d3.min(sample, function(d) { return d[c]}),
                max: d3.max(sample, function(d) { return d[c]}),
                mean: d3.mean(sample, function(d) { return d[c]})
              }});
            }
          }
          return o;
        })
        .transform(_.ary(_.extend, 2), {})
        .value();
    };

    $scope.cleanSample = function () {
      if ($scope.dataSample) delete $scope.dataSample;
    };

    $scope.validate = function(data){
      ContentModel.updateModel($scope.contentModel);
      ContentModel.validate(data).then(function (res) {
        $scope.validationResult = res.data;
        var entry = $scope.contentModel.tagModel ? res.data.tags : res.data.entity;
        $scope.rows = _.map(res.data.results, function (r, i) {
          return Object.assign(entry[i] || {code: i},
            { messages: _(r)
              .filter( function (res) { return res.messages.length > 0; })
              .map(function (m) {
                var msg = {};
                msg[m.sourceColumn]=m.messages;
                return msg;
              }).transform(_.ary(_.extend, 2), {})
              .value()
            });
        });
      });
      angular.element('[data-target="#validate"]').tab('show');
    };

    $scope.showResult = function ($index) {
      $scope.rowResult = $scope.rows[$index];

      $scope.loadViewer = function (instance) {
        $scope.resultViewer = instance;
      };
      $scope.loadMsgViewer = function (instance) {
        $scope.resultMsgViewer = instance;
      };
    };

    $scope.trackResult = function (validResult) {
      var payload = $scope.contentModel.tagModel ? validResult.tags[0] : validResult.entity;
      payload=_.map(payload, function (e) {
        return e;
      });
      $http.put(configuration.engineUrl()+'/api/v1/track/', payload).then(function (res) {
        toastr.success(res.statusText, 'Success');
      })
    };

    $scope.cancel = function () {
      $state.go('model');
    };

    $scope.$on('$stateChangeStart', function (event, next, current) {
      if (next.controller != "EditModelCtrl") {
        if (!$scope.saved()) {
          event.preventDefault();
          var discardDefaults = {
            size: 'sm'
          };
          var discardOptions = {
            title: 'Discard changes...',
            text: 'Are you sure you want to cancel and discard your changes?'
          };
          modalService.showModal(discardDefaults, discardOptions).then(function () {
            $scope.contentModel = originalModel;
            ContentModel.updateModel(originalModel);
            $state.go(next.name);
          });
        } else {
          window.onbeforeunload = null;
        }
      }
    });

    window.onbeforeunload = function (e) {
      var e = e || window.event;
      var msg = "Do you really want to leave this page?";
      if (e) {
        e.returnValue = msg;
      }

      return msg;
    };

  }]);

fdView.controller('EditColdefCtrl',['$scope','$uibModalInstance', 'modalService', 'coldef', 'tags', 'ContentModel',
  function ($scope, $uibModalInstance, modalService, coldef, tags, ContentModel) {
    $scope.name = Object.keys(coldef)[0];

    $scope.cd = angular.copy(coldef[$scope.name]);
    var contentModel = {};
    ContentModel.getModel().then(function (res) {
      contentModel = res;
      $scope.columns = Object.keys(contentModel.content);
      $scope.entity = res.tagModel ? '' : contentModel.documentType.name;
      $scope.tagModel = res.tagModel;
    });
    $scope.tags = tags;

    $scope.isAlias = !!$scope.cd.$$alias;

    if (coldef.options) {
      $scope.openAsTag = coldef.options.openAsTag;
    }
    $scope.caption = $scope.openAsTag ? 'Tag Input' : 'Column Definition';
    $scope.tab = $scope.cd.tag || $scope.openAsTag ? 1 : 0;

    $scope.dataTypes = ['string','number','date'];
    $scope.dateFormats = ['Automatic','timestamp','epoc','custom'];

    if (!!$scope.cd.dateFormat && $scope.dateFormats.indexOf($scope.cd.dateFormat) < 0) {
      $scope.cd.customDate = $scope.cd.dateFormat;
      $scope.cd.dateFormat = 'custom';
    }

    $scope.checkFormat = function () {
      if ($scope.cd.dataType === 'date') $scope.cd.dateFormat = $scope.cd.dateFormat || 'Automatic';
      if ($scope.cd.dataType !== 'date' && $scope.cd.dateFormat) { // Clean up on change
        delete $scope.cd.dateFormat;
        if ($scope.cd.customDate) delete $scope.cd.customDate;
      }
    };

    $scope.addEntityRel = function () {
      if (!$scope.cd.entityTagLinks) $scope.cd.entityTagLinks= [];
      $scope.cd.entityTagLinks.push({relationshipName: 'Undefined'});
    };

    if (coldef.options && coldef.options.link) {
      $scope.tab = 2; // EntityTagLinks
      $scope.addEntityRel();
    }

    $scope.convertTag = function (tag) {
      if (tag.tag) {
        if (tag.dataType) delete tag.dataType;
        if (tag.persistent) delete tag.persistent;
        if (tag.storeNull) delete tag.storeNull;
        $scope.tab = 1;
      } else {
        if (tag.$$id) delete tag.$$id;
        if (tag.targets) delete tag.targets;
        if (tag.entityTagLinks) delete tag.entityTagLinks;
      }
    };

    $scope.toggleAlias = function (alias) {
      if (alias) {
        $scope.cd.$$alias= {code: $scope.name};
      } else {
        delete $scope.cd.$$alias;
      }
    };

    $scope.addTarget = function (scope) {
      var tag = scope.$modelValue || scope;

      modalService.show({
        templateUrl: 'create-target.html',
        controller: ['$scope','$uibModalInstance','active', 'tags', function ($scope,$uibModalInstance,active, tags) {
          $scope.active = active.label || active.name || active;
          $scope.canConnect = [];
          _.each(tags, function (t) {
            if (t.id !== active.$$id) $scope.canConnect.push(t);
          });

          $scope.checkElem = function () {
            if ($scope.elem) delete $scope.elem;
          };
          $scope.cancel = $uibModalInstance.dismiss;
          $scope.ok = function (isValid) {
            if (isValid) {
              var target = $scope.elem || $scope.target;
              $uibModalInstance.close({target:target, relationship: $scope.rel});
            }
          };
        }],
        resolve: {
          active: function() {
            return tag;
          },
          tags: function () {
            return tags;
          }
        }
      }).then(function (res) {
        if (!tag.targets) tag.targets = [];
        var target = res.target.id ? ContentModel.findTag(res.target.id) : res.target;
        tag.targets.push(angular.extend(target, res.relationship));
      });
    };

    $scope.editProperty = function (properties, property) {
      modalService.show({
        templateUrl: 'edit-property.html',
        controller: ['$scope', '$uibModalInstance','property','contentModel','col', function ($scope, $uibModalInstance, property,contentModel,col) {
          $scope.dataTypes = ['string','number','date'];
          if (!!property) $scope.property = property;

          $scope.columns = contentModel.content;
          $scope.column = col;

          $scope.setProperties = function (col) {
            var cd = contentModel.content[col];
            $scope.property.dataType = cd.dataType;
            $scope.property.storeNull = cd.storeNull;
            if (cd.dataType==='date') $scope.property.dateFormat = cd.dateFormat;
          };

          $scope.cancel = $uibModalInstance.dismiss;
          $scope.ok = function (p) {
            $uibModalInstance.close(p);
          }
        }],
        resolve: {
          property: function () {
            return property;
          },
          contentModel: function () {
            return contentModel;
          },
          col: function () {
            return $scope.name;
          }
        }
      }).then(function (res) {
        if (res.$$hashKey) {
          angular.extend(property, res);
        } else {
          properties.push(res);
        }
      });
    };

    $scope.addProperty = function (obj) {
      if (!obj.properties) obj.properties = [];
      $scope.editProperty(obj.properties);
    };


    $scope.addEntityLink = function () {
      if (!$scope.cd.entityLinks) $scope.cd.entityLinks= [];
      $scope.cd.entityLinks.push({});
    };

    $scope.entityParentSelected = function (links) {
      return !!_.find(links,function (el) {
        return el.parent;
      })
    };

    $scope.cancel = function () {
      if (angular.equals($scope.cd, coldef[$scope.name])) {
        $uibModalInstance.dismiss();
      } else {
        var discardDefaults = {
          templateUrl: 'views/partials/confirmModal.html',
          size: 'sm'
        };
        var discardOptions = {
          title: 'Discard changes...',
          text: 'Are you sure you want to cancel and discard your changes?'
        };
        modalService.showModal(discardDefaults, discardOptions).then(function () {
          $uibModalInstance.dismiss();
        });
      }
    };
    $scope.ok = function (data) {
      if (data.dataType==='date') {
        data.dateFormat = (data.dateFormat==='custom' ? data.customDate : data.dateFormat);
        if (!!data.customDate) {delete data.customDate;}
      }

      if (data.name === "") delete data.name;

      $uibModalInstance.close(data);
    };
  }]);

fdView.controller('EditElementCtrl', ['$scope', '$uibModalInstance', 'elements', 'name', 'type',
  function ($scope, $uibModalInstance, elements, name, type) {
    $scope.elems = elements;
    $scope.elem = {};
    $scope.elem.name = name;
    $scope.types = ['entity','tag', 'alias'];
    $scope.elem.type = type;//$scope.types(type);

    $scope.ok = function () {
      $uibModalInstance.close({name: $scope.elem.name, elem: $scope.elem});
    };
    $scope.cancel = $uibModalInstance.dismiss;
  }]);

