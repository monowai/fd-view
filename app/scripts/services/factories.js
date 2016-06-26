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


fdView.factory('QueryService', ['$http', 'configuration', function ($http, configuration) {
  var lastMatrixQuery={},
      lastMatrixResult={};
  return {
      general: function (queryName) {
        return $http.get(configuration.engineUrl() + '/api/v1/' + queryName + '/').then(function (response) {
            return response.data;
          }
        );
      },
      query: function (queryName, params) {
        return $http.post(configuration.engineUrl() + '/api/v1/query/' + queryName + '/', params).then(function (response) {
            return response.data;
          }
        );
      },
      matrixSearch: function (fortresses, searchText, resultSize, documents, sumByCount, concepts, fromRlxs, toRlxs, minCount, reciprocals, byKey) {
        var dataParam = {
          documents: documents,
          sampleSize: resultSize,
          fortresses: fortresses,
          sumByCol: !sumByCount,
          queryString: searchText,
          concepts: concepts,
          fromRlxs: fromRlxs,
          toRlxs: toRlxs,
          minCount: minCount,
          reciprocalExcluded: reciprocals,
          byKey: byKey
        };
        if(dataParam === lastMatrixQuery) return lastMatrixResult;
        else lastMatrixQuery = dataParam;
        console.log(dataParam);
        var promise = $http.post(configuration.engineUrl() + '/api/v1/query/matrix/', dataParam).then(function (response) {
          angular.copy(response.data, lastMatrixResult);
          if(byKey===false) {
            return response.data.edges;
          } else return response.data;
        });
        return promise;
      },
      lastMatrix: function () {
        return lastMatrixResult;
      },
      tagCloud: function (searchText, documents, fortress, tags, relationships) {
        var tagCloudParams = {
          searchText: searchText,
          types: documents,
          fortress: fortress[0],
          tags: tags,
          relationships: relationships
        };
        return $http.post(configuration.engineUrl() + '/api/v1/query/tagcloud/', tagCloudParams).then(function (response) {
          return response.data;
        });
      }
    };
  }]
)
.factory('ContentModel', ['$http', '$q', 'configuration',
  function ($http, $q, configuration) {
    var cplist = [];
    var cp = {};
    var cpGraph = {};
    var cpFortress, cpType;
    var colDefs = [];
    return {
      getAll: function () {
        return $http.get(configuration.engineUrl() + '/api/v1/model/')
          .success(function (data) {
            angular.copy(data, cplist);
          });
      },
      getColDefs: function () {
        return colDefs;
      },
      addCol: function (col) {
        colDefs.push(col);
        var column = {};
        column[col.name]={dataType: col.dataType, persistent:true};
        _.extend(cp.content,column);
      },
      getCurrent: function () {
        return cp;
      },
      createEmpty: function (content) {
        cpFortress = content.fortress.name;
        cpType = content.documentType.name;
        cp = content;
        cp.content = {};

      },
      createDefault: function (fortress, doctype) {
        angular.copy(fortress, cpFortress);
        angular.copy(doctype, cpType);
        return $http.post(configuration.engineUrl() + '/api/v1/model/default/');
      },
      getFortress: function () {
        if (cpFortress) { return cpFortress; }
      },
      getDocType: function () {
        if (cpType) { return cpType; }
      },
      getModel: function (profile) {
        if (!profile || (profile.fortress===cpFortress && profile.documentType===cpType && cp!=={}) || (!profile.fortress && cp.length>0)) {
          var deferred = $q.defer();
          deferred.resolve(cp);
          return deferred.promise;
        } else {
          if (profile.fortress!==cpFortress) cpFortress=profile.fortress;
          if (profile.documentType!==cpType) cpType=profile.documentType;

          return $http.get(configuration.engineUrl() + '/api/v1/model/' + profile.key)
            .success(function (data) {
              console.log(data);
              angular.copy(data.contentModel, cp);
            });
        }
      },
      getDefault: function (data) {
        return $http.post(configuration.engineUrl() + '/api/v1/model/default', data)
          .success(function (res) {
            cp = res;
            cp.documentType = {name:cpType};
          });
      },
      graphModel: function () {
        if (_.isEmpty(cp)) return ;
        if (cpGraph.length>0) {
          return cpGraph;
        }
        else {
          var graph = {nodes: [], edges: []};
          colDefs = [];

          var createEntity = function (name, data) {
            var entity = new Object({id: name, name: name, type: 'entity'});
            _.extend(entity, data);
            return entity;
          };
          var isTag = function (o) {
            return Boolean(o.tag) === true || o.tagOrEntity === 'tag';
          };
          var createTag = function (key, data) {
            var tag = new Object({id: key, name: key, type: 'tag'});
            _.extend(tag, data);
            return tag;
          };
          var connect = function (source, target, rel) {
            return {source: source, target: target, relationship: rel};
          };

          var hasTargets = function (obj) {
            return !!obj.targets && obj.targets.length > 0;
          };

          var hasEntityLinks = function (obj) {
            return !!obj.entityLinks && obj.entityLinks.length > 0;
          };

          var hasAliases = function (obj) {
            return !!obj.aliases && obj.aliases.length > 0;
          };

          var containsEdge = function (edge) { // to check if edge is already in the graph
            return _.findIndex(graph.edges,function(o){return _.isMatch(o.data,edge)})>=0;
          };

          var createTargets = function (tag, id) {
            _.each(tag.targets, function (target) {
              var t = createTag(target.code, {label: target.label});
              graph.nodes.push({data: t});
              var src, tgt;
              if (target.reverse) {
                src = t.id;
                tgt = id || tag.code;
              } else {
                src = id || tag.code;
                tgt = t.id;
              }
              var edge = connect(src, tgt, target.relationship);
              if (!containsEdge(edge))
                graph.edges.push({data: edge});
              if (hasTargets(target)) createTargets(target);
            })
          };

          var root = {};

          if (!isTag(cp)) {
            root = createEntity(cp.documentName || cp.documentType.name);
            graph.nodes.push({data: root});
          } else {
            root = createTag(cp.documentName);
            graph.nodes.push({data: root});
          }
          _.each(cp.content, function (obj, key) {
            if (isTag(obj)) {
              colDefs.push({name: key, type: 'tag'});
              var label = (obj.label || key);
              var tag = {};
              var ti = _.findIndex(graph.nodes,function(o){return _.isMatch(o.data,{type: 'tag', label: label})}); // tag index in nodes array
              if(ti < 0) {
                tag = createTag(key, {label: label});
                graph.nodes.push({data: tag});
              } else {
                tag = graph.nodes[ti].data;
              }
              var edge = connect(root.id, tag.id, obj.relationship);
              if (!containsEdge(edge)) {
                graph.edges.push({data: edge});
              }

              if (hasTargets(obj)) {
                createTargets(obj, tag.id);
              }
              if (hasAliases(obj)) {
                _.each(obj.aliases, function (alias) {
                  var a = {id: alias.code, code: alias.code, description: alias.description, type: 'alias'};
                  graph.nodes.push({data: a});
                  graph.edges.push({data: connect(tag.id, a.id)});
                })
              }
            } else {
              colDefs.push({name: key, type: 'coldef'});
            }
            if (hasEntityLinks(obj)) {
              _.each(obj.entityLinks, function (entity) {
                var e = createEntity(entity.documentName);
                graph.nodes.push({data: e});
                graph.edges.push({data: connect(root.id, e.id, entity.relationshipName)});
              })
            }
          });
          angular.copy(graph, cpGraph);
          console.log(graph);
          return graph;
        }
      },
      updateModel: function (profile) {
        cp = {};
        angular.copy(profile, cp);
        // this.graphProfile();
      },
      saveModel: function () {
        var fcode = cpFortress.toLowerCase().replace(/\s/g, '');
        return $http.post(configuration.engineUrl() + '/api/v1/model/' + fcode +'/'+cpType+'/', cp);
      }
  };
}]);

fdView.service('modalService',['$uibModal', function ($uibModal) {
  var modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: 'views/partials/configDPModal.html'
  };

  this.showModal = function (customModalDefaults, customModalOptions) {
    if (!customModalDefaults) customModalDefaults = {};
    customModalDefaults.backdrop = 'static';
    return this.show(customModalDefaults, customModalOptions);
  };

  this.show = function (customModalDefaults, customModalOptions) {
    var tempModalDefaults = {};
    var tempModalOptions = {};

    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
    angular.extend(tempModalOptions, customModalOptions);

    if(!tempModalDefaults.controller) {
      tempModalDefaults.controller = ['$scope','$uibModalInstance','$http','configuration', function ($scope, $uibModalInstance, $http, configuration) {
        if (!tempModalOptions.disable) {
          
          $http.get(configuration.engineUrl() + '/api/v1/fortress/timezones').then(function (res) {
            $scope.timezones = res.data;
            if (!$scope.obj)
              $scope.obj = {
                searchEnabled: true,
                timeZone: moment.tz.guess()
              };
          });
        }
        $scope.modalOptions = tempModalOptions;
        $scope.obj = $scope.modalOptions.obj;
        $scope.ok = function (res) {
          $uibModalInstance.close(res);
        };
        $scope.close = $uibModalInstance.dismiss;
      }];
    }

    return $uibModal.open(tempModalDefaults).result;
  };

}]);
