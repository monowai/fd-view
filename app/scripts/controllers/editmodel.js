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

fdView.controller('EditModelCtrl', ['$scope', '$window', 'toastr', '$uibModal', 'QueryService', 'ContentModel', '$state', '$http', '$timeout', 'modalService', 'configuration',
  function ($scope, $window, toastr, $uibModal, QueryService, ContentModel, $state, $http, $timeout, modalService, configuration) {

    var originalModel = {};
    ContentModel.getModel().then(function (res) {
      $scope.contentModel = res;//.data.contentModel;
      originalModel = angular.copy(res);
      $scope.modelGraph = ContentModel.graphModel();
      $scope.colDefs = ContentModel.getColDefs();
      $scope.tags = ContentModel.getTags();
      $scope.list = 'Columns';
      if ($scope.modelGraph.nodes.length===1) {
        $timeout(function () {
          $scope.$broadcast('cytoscapeFitOne');
        }, 10);
      }
    });

    $scope.editorOptions = {
      mode: "tree",
      modes: ["tree", "code", "form"],
      expanded: true
    };
    $scope.onEditorLoad = function (instance) {
      $scope.editor = instance;
    };

    $scope.save = function () {
      var model = $scope.editor.get();
      ContentModel.updateModel(model);
      ContentModel.saveModel()
        .success(function (res) {
          toastr.success(res.statusText, 'Success');
          angular.element('[data-target="#structure"]').tab('show');
          $scope.modelGraph = ContentModel.graphModel();
          originalModel = angular.copy(model);
          $scope.colDefs = ContentModel.getColDefs();
          $timeout(function () {
            $scope.$broadcast('cytoscapeReset');
          }, 500);
        })
        .error(function (res) {
          toastr.error(res.message, 'Error');
        });
    };

    $scope.updateModel = function () {
      if (!!$scope.model && !angular.equals($scope.model, $scope.contentModel)) {
        angular.element('[data-target="#structure"]').tab('show');
        ContentModel.updateModel($scope.contentModel);
        $scope.modelGraph = ContentModel.graphModel();
        $scope.colDefs = ContentModel.getColDefs();
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
          'content': 'data(description)',
          'shape': 'ellipse',
          'width': '100',
          'height': '45'
        }
      },
      {
        'selector': 'edge',
        'css': {
          'content': 'data(relationship)',
          'width': 3,
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
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
      {name: 'random'}, {name: 'breadthfirst'}];
    $scope.layout = $scope.layouts[0];
    $scope.nodes = [];

    $scope.processDrop = function () {
      console.log('Element Dropped..');
    };

    $scope.createNew = function (event) {
      var creating = event.id || event.target.id;

      var selected = 'root';
      var findObj = function (o, id) {
        if (id in o) {
          return o[id];
        }
        if (o.code === id) {
          return o;
        }
        var res, p;
        for (p in o) {
          if (o.hasOwnProperty(p) && !!o[p] && typeof o[p] === 'object') {
            res = findObj(o[p], id);
            if (res) return res;
          }
        }
        return res;
      };
      if($scope.nodes.length>0 && $scope.nodes[0]._private.group==='nodes' && $scope.nodes[0]._private.data.type!=='entity') {
        selected = findObj($scope.contentModel.content, $scope.nodes[0]._private.data.id);
      }

      $uibModal.open({
        templateUrl: 'edit-element.html',
        controller: ['$scope','$uibModalInstance','active','creating', function ($scope,$uibModalInstance,active,creating) {
          $scope.elem = {};
          // $scope.elem.name = creating;
          $scope.types = ['string','number','date'];
          if (creating==='tag') $scope.elem.tag = true;
          if (active !== 'root' && (active.tag || !active.tag)) {
            // console.log(active);
            $scope.elem.tag = true;
            $scope.target = true;
          }
          $scope.active = active.name || active.label || active;// || active.dataType.name;
          $scope.cancel = $uibModalInstance.dismiss;

          $scope.ok = function (isValid) {
            if (isValid) {
              $uibModalInstance.close($scope.elem, $scope.active);
            }
          };

          $scope.coldefs = ContentModel.getTags();
          $scope.canConnect = [{name: 'root'}];
          _.extend($scope.canConnect, $scope.coldefs);
          // console.log($scope.canConnect);
          $scope.elem.properties = [];
          $scope.elem.properties.push({});
          $scope.elem.rlxProperties = [];
          $scope.elem.rlxProperties.push({});

        }],
        resolve: {
          active: function () {
            return selected;
          },
          creating: function () {
            return creating;
          }
        }
      }).result.then(function (res) {
        if(selected!=='root') {
          if(!selected.targets) {
            selected.targets = [];
          }
          delete res.tag;
          selected.targets.push(res);
        } else {
          // var colname = res.name;
          $scope.contentModel.content[res.name] = res;
          $scope.colDefs.push({name: res.name, type: creating});
        }
        ContentModel.updateModel($scope.contentModel);
        $scope.modelGraph = ContentModel.graphModel();

      });

    };

    $scope.createColumn = function () {
      var modalDefaults = {
        templateUrl: 'create-column.html',
        resolve: {
          colDefs: function () {
            return $scope.colDefs;
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
            return $scope.colDefs;
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

    $scope.showColDef = function (key, tag) {
      var cp = ContentModel.getCurrent();
      var col = {};
      if (tag) {
        (function findTag(list, id) {
          _.find(list, function (o) {
            if (o.$$id === id) {
              o.openAsTag=true;
              col[o.label]=o;
            }
            if (o.targets) findTag(o.targets, id);
          });
        })(cp.content,key);
      } else {
        col = _.pick(cp.content, key);
      }
      $uibModal.open({
        backdrop: 'static',
        templateUrl: 'edit-coldef.html',
        size: 'lg',
        controller: 'EditColdefCtrl',
        resolve: {
          coldef: function () {
            return col;
          }
        }
      }).result.then(function (res) {
        if (tag) {
          var t = col[Object.keys(col)[0]];
          _.extend(t, res);
          delete t.openAsTag;
        } else {
          cp.content[key] = res;
        }

        ContentModel.updateModel(cp);
        $scope.contentModel = cp;
        $scope.modelGraph = ContentModel.graphModel();
        $scope.colDefs = ContentModel.getColDefs();
      });
    };

    $scope.handleDrop = function (component, board, event) {
      var
        droppableDocumentOffset = $(board).offset(),
        left = (event.x || event.clientX) - droppableDocumentOffset.left - (component.clientWidth / 2) + $window.pageXOffset,
        top = (event.y || event.clientY) - droppableDocumentOffset.top - (component.clientHeight / 2) + $window.pageYOffset,
      // type = component.attributes['data-type'].value,
        name = component.id,
      // name = selectedComponents.getElementName(type),
      // componentInstance = allComponents[type],
      // isBinary = component.attributes['data-binary'].value === 'true',
        rect;

      console.log(event);

      $scope.createNew(component);

    };

    $scope.delim=',';
    $scope.hasHeader=true;

    $scope.loadFile = function(fileContent, fileName){
      $scope.fileName = fileName;
      $scope.csvContent = fileContent;
    };

    $scope.getDefault = function () {
      var data=[];
      if ($scope.csvContent) {
        var csvParser = d3.dsv($scope.delim, 'text/plain');
        csvParser.parse($scope.csvContent, function (d) {
          data.push(d);
        });
      } else {
        toastr.warning('File is not loaded', 'Warning');
      }
      $scope.dataSample = data.slice(0,50);
      ContentModel.getDefault({rows: $scope.dataSample}).success(function (res) {
        toastr.success('Data is loaded', 'Success');
        $scope.model = {};
        $scope.contentModel = res;
        $scope.modelGraph = ContentModel.graphModel();
        $scope.colDefs = ContentModel.getColDefs();
        $scope.keys = _(Object.keys($scope.dataSample[0]))
          .chain()
          .map(function (key) {
            var colDef = _.find($scope.colDefs, function (c) {
              return c.name === key;
            });
            if (key==='$$hashKey') return ;
            return {name: key, type: colDef.type};
          })
          .filter(function (o) {
            return !!o;
          })
          .value();
      }).error(function (res) {
        toastr.error(res, 'Error');
      });
    };

    $scope.validate = function(){
      // $http.put(configuration.engineUrl() + '/api/v1/fortress/' + someProfile.fortressName+'/'+someProfile.documentType.name).then(function (response) {
      //   console.log(response.data);
      //   return response.data;
      // });
    };

    $scope.cancel = function () {
      $state.go('model');
    };

    $scope.$on('$stateChangeStart', function (event, next, current) {
      if (next.controller != "EditModelCtrl") {
        if (!angular.equals($scope.contentModel, originalModel)) {
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

fdView.controller('EditColdefCtrl',['$scope','$uibModalInstance', 'modalService', 'coldef', 'ContentModel',
  function ($scope, $uibModalInstance, modalService, coldef, ContentModel) {
    $scope.name = Object.keys(coldef)[0];

    $scope.cd = angular.copy(coldef[$scope.name]);
    $scope.columns = ContentModel.getColDefs();
    $scope.colNames = _.map($scope.columns, function (c) {
      return c.name;
    });

    if ($scope.cd.openAsTag) {
      $scope.caption = 'Tag Input';
      $scope.tab=1;
    } else {
      $scope.caption = 'Column Definition'
    }

    $scope.dataTypes = ['string','number','date'];
    $scope.dateFormats = ['timestamp','epoc','custom'];

    if (!!$scope.cd.dateFormat && $scope.dateFormats.indexOf($scope.cd.dateFormat) < 0) {
      $scope.cd.customDate = $scope.cd.dateFormat;
      $scope.cd.dateFormat = 'custom';
    }

    $scope.props = _.union(_.map($scope.cd.properties, function (p) {
      p.$$rlx = 'properties';
      return p;
    }),_.map($scope.cd.rlxProperties, function (p) {
      p.$$rlx = 'rlxProperties';
      return p;
    }));

    var propsCopy = angular.copy($scope.props);

    $scope.editProperty = function (property) {
      modalService.show({
        templateUrl: 'tag-property.html',
        controller: ['$scope', '$uibModalInstance','property','columns','col', function ($scope, $uibModalInstance, property,columns,col) {
          $scope.dataTypes = ['string','number','date'];
          if (!!property) $scope.property = property;
          else $scope.property ={$$rlx: 'properties'};
          $scope.columns = columns;
          $scope.column = col;

          $scope.cancel = $uibModalInstance.dismiss;
          $scope.ok = function (p) {
            $uibModalInstance.close(p);
          }
        }],
        resolve: {
          property: function () {
            return property;
          },
          columns: function () {
            return $scope.columns;
          },
          col: function () {
            return $scope.name;
          }
        }
      }).then(function (res) {
        if (!$scope.props) $scope.props = [];
        if (res.$$hashKey) {
          angular.extend(property, res);
        } else {
          $scope.props.push(res);
        }
      });
    };

    $scope.addEntityLink = function () {
      if (!$scope.cd.entityLinks) $scope.cd.entityLinks= [];
      $scope.cd.entityLinks.push({});
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
      if (!angular.equals(propsCopy, $scope.props)) {
        var props = _.groupBy($scope.props, function (o) {
          return o.$$rlx;
        });

        data.properties = props['properties'];
        data.rlxProperties = props['rlxProperties'];
      }
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

