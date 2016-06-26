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

    ContentModel.getModel().then(function (res) {
      $scope.contentModel = res;//.data.contentModel;
      $scope.modelGraph = ContentModel.graphModel();
      $scope.colDefs = ContentModel.getColDefs();
      if ($scope.modelGraph.nodes.length===1) {
        $timeout(function () {
          $scope.$broadcast('cytoscapeFitOne');
        }, 10);
      }
    });

    $scope.editorOptions = {
      tree: {mode: "tree", modes: ["tree", "code", "form"]},
      text: {mode: "text", modes: ["text", "code"]}
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
          $scope.colDefs = ContentModel.getColDefs();
          $timeout(function () {
            $scope.$broadcast('cytoscapeReset');
          }, 500);

        })
        .error(function (res) {
          toastr.error(res.message, 'Error');
        });
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
          'text-outline-color': '#888',
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

          $scope.coldefs = ContentModel.getColDefs();
          $scope.canConnect = [{name: 'root'}];
          _.extend($scope.canConnect, $scope.coldefs);
          console.log($scope.canConnect);
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

    $scope.showColDef = function (key) {
      var cp = ContentModel.getCurrent();
      var col = _.pick(cp.content, key);
      $uibModal.open({
        templateUrl: 'edit-coldef.html',
        size: 'lg',
        controller: 'EditColdefCtrl',
        resolve: {
          coldef: function () {
            return col;
          }
        }
      }).result.then(function (res) {
        cp.content[key] = res;
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


      // $uibModal.open({
      //   templateUrl: 'edit-element.html',
      //   controller: 'EditElementCtrl',
      //   resolve: {
      //     elements: function () {
      //       return $scope.elements;
      //     },
      //     name: function () {
      //       return name;
      //     },
      //     type: function () {
      //       return type;
      //     }
      //   }
      // }).result.then(function (data) {
      //   console.log(data);
      //
      //   var obj = data.elem;
      //   $scope.elements.push(obj);
      //
      //   if(obj.type==='entity') {rect = jentity.clone();}
      //   if(obj.type==='tag') {rect = jtag.clone();}
      //   if(obj.type==='alias') {rect = jalias.clone();}
      //   rect.position(left, top).attr('text/text',data.name);
      //   // rect = new jentity({//graphElement({
      //   //   position: { x: left, y: top },
      //   //   size: { width: 216, height: 90 },
      //   //   name: name,
      //   //   // logo: component.attributes['data-logo'].value,
      //   //   // binary: isBinary,
      //   //   options: {interactive: true}
      //   // });
      //
      //   graph.addCell(rect);
      //   rect.on('createLink', createLink);
      //   rect.on('removeLink', removeLink);
      //   rect.on('onOpenDetail', onOpenDetail);
      //   rect.on('onRemove', onRemove);
      //
      //   $scope.diaEntities[obj.name] = rect;
      //
      //   if (!!obj.linked) {
      //
      //   }
      //
      //   //$scope.components[name] = angular.copy(componentInstance);
      //   $scope.components[name].name = name;

      // $scope.$apply();
    };

    $scope.uploadFile = function () {
      $uibModal.open({
        templateUrl: 'upload-file.html',
        controller: ['$scope', '$uibModalInstance', 'toastr', function ($scope,$uibModalInstance, toastr) {
          $scope.delim=',';
          $scope.hasHeader=true;

          $scope.cancel = $uibModalInstance.dismiss;

          $scope.loadFile = function(fileContent, fileName){
            $scope.fileName = fileName;
            $scope.csvContent = fileContent;
          };

          $scope.createDefault = function () {
            var data=[], keys;
            if ($scope.csvContent) {
              var csvParser = d3.dsv($scope.delim, 'text/plain');
              csvParser.parse($scope.csvContent, function (d) {
                data.push(d);
                keys = d3.keys(d);
              });
            } else {
              toastr.warning('File is not loaded', 'Warning');
            }
            $uibModalInstance.close(data.slice(0,50));
          };
        }]
      }).result.then(function (data) {
        ContentModel.getDefault({rows: data}).success(function (res) {
          $scope.contentModel = res;
          $scope.modelGraph = ContentModel.graphModel();
          $scope.colDefs = ContentModel.getColDefs();
          $timeout(function () {
            $scope.$broadcast('cytoscapeFitOne');
          }, 10);
        }).error(function (res) {
          toastr.error(res, 'Error');
        });
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
    }

  }]);

fdView.controller('EditColdefCtrl',['$scope','$uibModalInstance', '$uibModal', 'coldef', 'ContentModel',
  function ($scope, $uibModalInstance, $uibModal, coldef, ContentModel) {
    $scope.name = Object.keys(coldef)[0];
    $scope.cd = coldef[$scope.name];
    $scope.columns = ContentModel.getColDefs();
    $scope.colNames = _.map($scope.columns, function (c) {
      return c.name;
    });

    $scope.dataTypes = ['string','number','date'];
    $scope.dateFormats = ['timestamp','epoc','custom'];

    if (!!$scope.cd.dateFormat && $scope.dateFormats.indexOf($scope.cd.dateFormat) < 0) {
      $scope.cd.customDate = $scope.cd.dateFormat;
      $scope.cd.dateFormat = 'custom';
    }

    $scope.editProperty = function (property) {
      $uibModal.open({
        templateUrl: 'tag-property.html',
        controller: ['$scope', '$uibModalInstance','property','columns', function ($scope, $uibModalInstance, property,columns) {
          $scope.dataTypes = ['string','number','date'];
          if (!!property) $scope.property = property;
          $scope.columns = columns;

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
          }
        }
      }).result.then(function (res) {
        if (!$scope.cd.properties) $scope.cd.properties = [];
        $scope.cd.properties.push(res);
      });
    };

    $scope.addEntityLink = function () {
      if (!$scope.cd.entityLinks) $scope.cd.entityLinks= [];
      $scope.cd.entityLinks.push({});
    };

    $scope.cancel = $uibModalInstance.dismiss;
    $scope.ok = function (data) {
      if (data.dataType==='date') {
        data.dateFormat = (data.dateFormat==='custom' ? data.customDate : data.dateFormat);
        if (!!data.customDate) {delete data.customDate;}
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

