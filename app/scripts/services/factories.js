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
  return {
      general: function (queryName) {
        return $http.get(configuration.engineUrl() + '/api/v1/' + queryName + '/').then(function (response) {
            return response.data;
          }
        );
      },
      doc: function (fortressName, docType) {
        var query = fortressName ? fortressName+'/' + (docType ? docType+'/' : '' ) : '';
        return $http.get(configuration.engineUrl() + '/api/v1/doc/'+query).then(function (response) {
          return response.data;
        })
      },
      concept: function (route, params) {
        return $http.post(configuration.engineUrl() + '/api/v1/concept' + route, params).then(function (response) {
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
      },
      fields: function(fortress, doctype) {
        return $http.get(configuration.engineUrl() + '/api/v1/model/'+fortress+'/'+doctype+'/fields').then(function (response) {
          return response.data;
        });
      }
    };
  }]
)
.factory('ContentModel', ['$http', '$q', 'configuration',
  function ($http, $q, configuration) {
    var cp = {},            // actual content model
        cpGraph = {},       // latest graph visualization of the content model
        cpFortress, cpType, // fortress and doctype of the current content model
        code,               // code for tag only model
        tags = [],          // list of tags
        validationResult;

    return {
      getAll: function () {
        return $http.get(configuration.engineUrl() + '/api/v1/model/');
      },
      getTags: function () {
        return tags;
      },
      findTag: function (id) {
      var tag = {};
      (function findInList(list, id) {
        _.find(list, function (o) {
          if (o.$$id === id) {
            return tag = o;//[o.label] = o;
          }
          if (o.targets) findInList(o.targets, id);
        });
      })(cp.content, id);
      return tag;
    },
      addCol: function (col) {
        var column = {};
        column[col.name]={dataType: col.dataType, persistent:true};
        _.extend(cp.content,column);
      },
      addEntitylink: function (col, el) {
        var cd = cp.content[col];
        if (_.has(cd, 'entityLinks'))
          cd.entityLinks.push(el);
        else
          cd['entityLinks'] = [el];

        // add to graph
        // cpGraph.nodes.push({
        //   data: {
        //     id: el.documentName,
        //     name: el.documentName,
        //     type: 'entity'
        //   }
        // });
        // cpGraph.edges.push({
        //   data: {
        //     source: cpGraph.nodes[0].data.id,
        //     target: el.documentName,
        //     label: el.relationshipName
        //   }
        // });
      },
      addTag: function (tag) {
        tag.$$id = tag.$$id || _.uniqueId('tag_');
        tags.push({label: tag.label || tag.code, id: tag.$$id});
        return tag.$$id;
      },
      addAlias: function (tag, alias) {
        var t = this.findTag(tag.id);
        console.log(t);
        if (_.has(t, 'aliases'))
          t.aliases.push(alias);
        else
          t['aliases'] = [alias];
      },
      getCurrent: function () {
        return cp;
      },
      getModel: function (modelKey) {
        if (!modelKey) {
          var deferred = $q.defer();
          deferred.resolve(cp);
          return deferred.promise;
        } else {
          return $http.get(configuration.engineUrl() + '/api/v1/model/' + modelKey)
            .success(function (data) {
              cp = data.contentModel;
              if (!cp.tagModel) {
                cpFortress = cp.fortress.name;
                cpType = cp.documentType.name;
              }
              tags = [];
            });
        }
      },
      downloadModel: function (keys) {
        return $http.post(configuration.engineUrl() + '/api/v1/model/download', keys);
      },
      deleteModel: function (key) {
        return $http.delete(configuration.engineUrl() + '/api/v1/model/' + key);
      },
      getDefault: function (data) {
        var payload = angular.extend({contentModel: cp}, data);

        return $http.post(configuration.engineUrl() + '/api/v1/model/default', payload)
          .success(function (res) {
            cp.content = res.content;
          });
      },
      validate: function (data) {
        var payload = {contentModel: cp, rows: data};

        return $http.post(configuration.engineUrl() + '/api/v1/model/validate', payload)
          .success(function (res) {
            validationResult = res;
            return validationResult;
          });
      },
      graphModel: function () {
        if (!_.isEmpty(cp)) {
          var graph = {nodes: [], edges: []};

          var createEntity = function (name, data) {
            var entity = new Object({id: name, name: name, type: 'entity'});
            _.extend(entity, data);
            return entity;
          };

          var isTagModel = function (model) {
            return model.tagModel;
          };

          var isTag = function (o) {
            return Boolean(o.tag) === true;
          };

          var createTag = function (id, data) {
            var tag = new Object({id: id, name: id, type: 'tag'});
            _.extend(tag, data);
            return tag;
          };

          var connect = function (source, target, rel, reverse, type) {
            var edge = {};
            if (reverse) {
              edge = {source: target, target: source, relationship: rel, type: type};
            } else {
              edge = {source: source, target: target, relationship: rel, type: type};
            }
            if (!containsEdge(edge))
              graph.edges.push({data: edge});
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

          var containsTag = function (tag) {
            var t = graph.nodes[_.findIndex(graph.nodes,function(o){
              return _.isMatch(o.data,{type: 'tag', label: tag.label, code: tag.code});
            })];
            if (!!t) return t.data;
            else return false;
          };

          var createTargets = function (tag) {
            _.each(tag.targets, function (target) {
              var tgData = {label: target.label, code: target.code};
              var t = containsTag(tgData);
              if(!t) {
                t = createTag(target.$$id  || this.addTag(target), tgData);
                graph.nodes.push({data: t});
              } else {
                target.$$id = t.id;
              }
              connect(tag.$$id, t.id, target.relationship, target.reverse);
              if (hasTargets(target)) createTargets(target);
            }.bind(this))
          }.bind(this);

          var root = {};

          if (!isTagModel(cp)) {
            var entityName = !!cp.documentType ? cp.documentType.name : 'Name Missing!';
            root = createEntity(cp.documentName || entityName);
            graph.nodes.push({data: root});
          }

          _.each(cp.content, function (obj, key) {
            if (isTag(obj)) {
              var label = (obj.label || key);
              var tag = containsTag(obj);
              if(!tag) {
                obj.code = obj.code || key;
                tag = createTag(obj.$$id || this.addTag(obj), {label: label, code: obj.code});
                graph.nodes.push({data: tag});
              } else obj.$$id = tag.id;
              if(!_.isEmpty(root)) {
                if (obj.entityTagLinks) {
                  _.each(obj.entityTagLinks, function (link) {
                    connect(root.id, tag.id, link.relationshipName, link.reverse, link.geo ? 'geo' : undefined);
                  });
                }
              }

              if (hasTargets(obj)) {
                createTargets(obj);
              }

              if (hasAliases(obj)) {
                _.each(obj.aliases, function (alias) {
                  var a = {
                    id: alias.code,
                    code: alias.code,
                    description: alias.description,
                    type: 'alias'
                  };
                  graph.nodes.push({data: a});
                  connect(tag.id, a.id);
                })
              }
            }
            if (hasEntityLinks(obj)) {
              _.each(obj.entityLinks, function (entity) {
                var e = createEntity(entity.documentName);
                graph.nodes.push({data: e});
                connect(root.id, e.id, entity.relationshipName,obj.reverse);
              })
            }
          }.bind(this));
          cpGraph = graph;
          console.log(graph);
          return graph;
        }
      },
      uploadModel: function (models) {
        return $http.post(configuration.engineUrl()+'/api/v1/model/', models)
      },
      updateModel: function (profile) {
        cp = profile;
        if (cp.code) code = cp.code;
        cpType = !!cp.documentType ? cp.documentType.name : cpType;
        cpFortress = !!cp.fortress ? cp.fortress.name : cpFortress;
      },
      saveModel: function () {
        var url;
        if (cp.tagModel)
          url = 'tag/'+ code;
        else {
          var fcode = cpFortress.toLowerCase().replace(/\s/g, '');
          url = fcode +(!!cpType ? '/'+cpType : '');
        }

        return $http.post(configuration.engineUrl()+'/api/v1/model/' + url, cp);
      }
  };
}])

.service('modalService',['$uibModal', function ($uibModal) {
  var modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: 'views/partials/confirmModal.html'
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

}])

.service('MatrixRequest', ['$http', '$q', 'configuration', function ($http, $q, configuration) {
  var lastMatrixQuery={}, lastMatrixResult={};

  this.minCount = 1;
  this.resultSize = 1000;
  this.sharedRlxChecked = false;
  this.reciprocalExcludedChecked = true;
  this.sumByCountChecked = true;
  // if (configuration.devMode()) {
  this.devMode = configuration.devMode();//'true';
  // } else {
  //   delete this.devMode;
  // }
  this.matrixSearch = function () {
    if (this.sharedRlxChecked) {
      this.toRlx = this.fromRlx;
    }
    var dataParam = {
      documents: this.document,
      sampleSize: this.resultSize,
      fortresses: this.fortress,
      sumByCol: !this.sumByCountChecked,
      queryString: this.searchText,
      concepts: this.concept,
      fromRlxs: this.fromRlx,
      toRlxs: this.toRlx,
      minCount: this.minCount,
      reciprocalExcluded: this.reciprocalExcludedChecked,
      byKey: true
    };
    if(angular.equals(dataParam, lastMatrixQuery)) {
      var deferred = $q.defer();
      deferred.resolve(lastMatrixResult);
      return deferred.promise;
    } else {
      lastMatrixQuery = angular.copy(dataParam);
      return $http.post(configuration.engineUrl() + '/api/v1/query/matrix/', dataParam).then(function (response) {
        lastMatrixResult = angular.copy(response.data);
        lastMatrixResult.matrix = _.map(lastMatrixResult.edges, function (edge) {
          return {
            count: edge.data.count,
            source: _.find(lastMatrixResult.nodes, function (node) {
              return node.data.id === edge.data.source;
            }).data.name,
            target: _.find(lastMatrixResult.nodes, function (node) {
              return node.data.id === edge.data.target;
            }).data.name
          }
        });
        return lastMatrixResult;
      });
    }
  };
  this.sharedChecked = function () {
    return lastMatrixQuery.toRlxs===lastMatrixQuery.fromRlxs;
  };
  this.reciprocalExcluded = function () {
    return lastMatrixQuery.reciprocalExcluded;
  };
  this.lastMatrix = function () {
    return lastMatrixResult;
  };

}]);
