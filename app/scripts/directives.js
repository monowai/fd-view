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

angular.module('fdView.directives', [])
  .directive('ngAbTable', function () {
    return {
      restrict: 'E, A, C',
      link: function (scope, element, attrs, controller) {
        // If Actions Defined
        if (scope.actions) {
          scope.options.aoColumns.push(scope.actions);
        }
        var dataTable = element.dataTable(scope.options);

        scope.$watch('options.aaData', handleModelUpdates, true);

        function handleModelUpdates(newData) {
          var data = newData || null;
          if (data) {
            dataTable.fnClearTable();
            dataTable.fnAddData(data);
          }
        }
      },
      scope: {
        options: '=',
        actions: '='
      }
    };
  })
  .directive('ngJsonabview', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(attrs.abData, function (newValue) {
          var container = document.getElementById(attrs.id);
          $('#' + attrs.id).empty();
          var options = {
            mode: 'view'
          };
          var editor = new JSONEditor(container, options);
          var data = scope.$eval(attrs.abData);

          editor.set(data);
        });

//                var container = document.getElementById(attrs.id);
//                var options = {
//                    mode: 'view'
//                };
//                var editor = new JSONEditor(container,options);
//                var data = scope.$eval(attrs.abData);
//
//                editor.set(data);
      }
    };
  })
  .directive('ngJsondiff', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var left = scope.$eval(attrs.abLeft);
        var right = scope.$eval(attrs.abRight);

        var delta = jsondiffpatch.create({
          objectHash: function (obj) {
            return obj._id || obj.id || obj.name || JSON.stringify(obj);
          }
        }).diff(left, right);

        jsondiffpatch.formatters.html.hideUnchanged();
        // beautiful html diff
        document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
        // self-explained json
        document.getElementById('annotated').innerHTML = jsondiffpatch.formatters.annotated.format(delta, left);
      }
    }
  })
  .directive('ngJsondiff2', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        //scope.$watchCollection(['attr.abLeft','attrs.abRight'], function (newValue) {
        scope.$watch(attrs.abLeft, function (newValue) {
          var left = scope.$eval(attrs.abLeft);
          var right = scope.$eval(attrs.abRight);

          var delta = jsondiffpatch.create({
            objectHash: function (obj) {
              return obj._id || obj.id || obj.name || JSON.stringify(obj);
            }
          }).diff(left, right);

          jsondiffpatch.formatters.html.hideUnchanged();
          // beautiful html diff
          document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
        });
      }
    }
  })
  .directive('ngFlockdeltapopup', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/deltaPopup.html'
    }
  })
  .directive('ngFlocksinglelogpopup', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/singleLogPopup.html'
    }
  })
  .directive('autofocus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link : function(scope, element) {
        $timeout(function() {
          element[0].focus();
        });
      }
    }
  }])
  .directive('ngHeight', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var winHeight = $window.innerHeight;
            var headerHeight = attrs.ngHeight ? attrs.ngHeight : 0;
            elem.css('height', winHeight - headerHeight + 'px');
        }
    }
  }])
  .directive('fileBox', ['$parse', function($parse) {
      return {
        restrict: 'AE',
        scope: false,
        template: '<div class="file-box-input">'+
                  '<input type="file" id="file" class="box-file">'+
                  '<label for="file" align="center"><strong>'+
                  '<i class="fa fa-cloud-download"></i> Click</strong>'+
                  '<span> to select a delimited file, or drop it here</span>.</label></div>'+
                  '<div class="file-box-success"><strong>Done!</strong>&nbsp;{{fileName}} is loaded</div>',
        link: function(scope, element, attrs) {
          var fn = $parse(attrs.fileBox);

          element.on('dragover dragenter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            element.addClass('is-dragover');
          });
          element.on('dragleave dragend',function() {
            element.removeClass('is-dragover');
          });
          element.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if(e.originalEvent.dataTransfer){
              if (e.originalEvent.dataTransfer.files.length>0) {
                var reader = new FileReader();
                reader.fileName = e.originalEvent.dataTransfer.files[0].name;
                reader.onload = function(onLoadEvent) {
                  scope.$apply(function() {
                    fn(scope, {$fileContent:onLoadEvent.target.result, $fileName:reader.fileName});
                  });
                  element.addClass('is-success');
                };
              }
            }
            reader.readAsText(e.originalEvent.dataTransfer.files[0]);
          });
          element.on('change', function(onChangeEvent) {
            var reader = new FileReader();
            reader.fileName = onChangeEvent.target.files[0].name;
            reader.onload = function(onLoadEvent) {
              scope.$apply(function() {
                fn(scope, {$fileContent:onLoadEvent.target.result, $fileName:reader.fileName});
              });
              element.addClass('is-success');
            };
            reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
          });
        }
      };
    }])
  .directive('cytoscape', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      template: '<div id="cy"></div>',
      replace: true,
      scope: {
        elements: '=',
        styles: '=',
        layout: '=',
        selectedNodes: '=',
        highlightByName: '=',
        onComplete: '=',
        onChange: '=',
        nodeClick: '=',
        navigatorContainerId: '@',
        contextMenuCommands: '=',
        onEdge: '&?',
        qtip: '='
      },
      link: function(scope, element, attrs, controller) {
        scope.$watchGroup(['elements', 'styles', 'layout'], function(newValues, oldValues, scope) {
          var safe = true;
          for ( var i in newValues)
            if (!newValues[i]) safe = false;
          if (safe) {
            var elements = newValues[0];
            var styles = newValues[1];
            var layout = newValues[2];
            cytoscape({
              container: element[0],
              elements: elements,
              style: styles,
              layout: layout,
              boxSelectionEnabled: true,
              motionBlur: false,
              wheelSensitivity: 0.2,
              ready: function() {
                var cy = this;
                // Run layout after add new elements
                var runLayout = function(addedElements) {
                  if (addedElements) {
                    layout.maxSimulationTime = 10;
                    layout.fit = false;
                    var addLayout = addedElements.makeLayout(layout);
                    addLayout.pon('layoutstop').then(function(event) {
                      layout.maxSimulationTime = 2000;
                      cy.elements().makeLayout(layout).run();
                    });
                    addLayout.run();
                  }
                };

                // the default values for edgehandles plugin:
                var defaults = {
                  preview: false, // whether to show added edges preview before releasing selection
                  stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
                  handleSize: 10, // the size of the edge handle put on nodes
                  handleColor: '#ff0000', // the colour of the handle and the line drawn from it
                  handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
                  handleLineWidth: 1, // width of handle line in pixels
                  handleNodes: 'node[type!="alias"]', // selector/filter function for whether edges can be made from a given node
                  hoverDelay: 150, // time spend over a target node before it is considered a target selection
                  cxt: false, // whether cxt events trigger edgehandles (useful on touch)
                  enabled: !!scope.onEdge, // whether to start the extension in the enabled state
                  toggleOffOnLeave: false, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
                  edgeType: function( sourceNode, targetNode ) {
                    // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
                    // returning null/undefined means an edge can't be added between the two nodes
                    return 'flat';
                  },
                  loopAllowed: function( node ) {
                    // for the specified node, return whether edges from itself to itself are allowed
                    return false;
                  },
                  nodeLoopOffset: -50, // offset for edgeType: 'node' loops


                  complete: function( sourceNode, targetNode, addedEntities ) {
                    // fired when edgehandles is done and entities are added
                    scope.onEdge({source: sourceNode[0]._private.data,
                                  target: targetNode[0]._private.data});
                  }
                };

                cy.edgehandles( defaults );

                // QTip
                cy.elements().qtip({
                  content: scope.qtip,//function(){ return this[0]._private.data.code },
                  position: {
                    my: 'top center',
                    at: 'bottom center'
                  },
                  style: {
                    classes: 'qtip-bootstrap',
                    tip: {
                      width: 16,
                      height: 8
                    }
                  }
                });

                // Tap
                cy.on('tap', function(event) {
                  if (event.cyTarget === cy)
                    $timeout(function() {
                      scope.selectedNodes = [];
                      // scope.selectedElements = cy.$(':selected');
                      // console.log(cy.$(':selected'));
                  }, 10);
                  else
                    $timeout(function() {
                      scope.selectedNodes = cy.$(':selected');
                      // console.log(scope.selectedNodes[0].data());
                    }, 10);
                });
                // cy.on('tap', 'node', function (event) {
                //   console.log(event.cyTarget.data());
                //   scope.$apply(function () {
                //     scope.selectedNodes.push(event.cyTarget.data());
                //   });
                // });
                // Mouseout
                cy.on('mouseout', function() {
                  cy.elements().removeClass('mouseover');
                  cy.elements().removeClass('edge-related');
                });
                // Mouseover
                cy.on('mouseover', function(event) {
                  var target = event.cyTarget;
                  if (target != event.cy) {
                    target.addClass('mouseover');
                    target.neighborhood().edges()
                      .addClass('edge-related');
                  }
                });
                cy.on('cxttapstart', 'node', function (event) {
                  // console.log(event);
                });
                cy.on('mouseup', function (event) {
                  // console.log(event);
                });
                cy.on('drop',function (event) {
                  console.log(event);
                });

                // Add elements
                scope.$on('cytoscapeAddElements', function(event, data) {
                  var addElements = data.elements;
                  var addedElements = cy.add(addElements);
                  runLayout(addedElements);
                  //scope.onChange(cy, data.forceApply);
                });
                // Delete elements
                scope.$on('cytoscapeDeleteElements', function(event, data) {
                  var deleteElements = data.elements;
                  try {
                    cy.remove(deleteElements);
                  } catch (exception) {
                    for ( var i in deleteElements) {
                      cy.remove(cy.$('#'
                        + deleteElements[i].data.id));
                    }
                  }
                  scope.onChange(cy, data.forceApply);
                });
                scope.$on('cytoscapeReset', function (event) {
                  cy.resize();
                  if (elements.nodes.length > 1) {
                    cy.fit(elements, 15);
                  } else {
                    cy.fit(elements, cy.width()/5);
                  }
                });
                scope.$on('cytoscapeFitOne', function () {
                  cy.fit(elements, cy.width()/5);
                });
                scope.$on('dropped', function (event, data) {
                  console.log('dropped', event);
                });
                // Filter nodes by name
                scope.$watch('highlightByName', function(name) {
                  cy.elements().addClass('searched');
                  if (name && name.length > 0) {
                    var cleanName = name.toLowerCase().trim();
                    var doHighlight = function(i, node) {
                      var currentName = node.data().name.toLowerCase()
                        .trim();
                      if (currentName.indexOf(cleanName) > -1)
                        node.removeClass('searched');
                    };
                    cy.nodes().each(doHighlight);
                  } else {
                    cy.elements().removeClass('searched');
                  }
                });
                // Navigator
                if (scope.navigatorContainerId) {
                  cy.navigator({
                    container: document.getElementById(scope.navigatorContainerId)
                  });
                }
                // Context menu
                if (scope.contextMenuCommands) {
                  cy.cxtmenu({
                    menuRadius: 75,
                    indicatorSize: 17,
                    activePadding: 10,
                    selector: 'node',
                    commands: scope.contextMenuCommands
                  });
                }
                // On complete
                if (scope.onComplete) {
                  scope.onComplete({
                    graph: cy,
                    layout: layout
                  });
                }
              }
            });
          }
        });
      }
    }
  }])
  .directive('draggable', function () {
    return function (scope, element) {
      // this gives us the native JS object
      var el = element[0];
      el.draggable = true;

      el.addEventListener('dragstart', function (e) {
        console.log(this);

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('id', this.id);
        this.classList.add('dragging');
        return false;
      }, false);

      el.addEventListener('dragend', function () {
        this.classList.remove('dragging');

        return false;
      }, false);
    };
  })
  .directive('droppable', function () {
    return {
      scope: {
        droppable: '='
      },
      link: function (scope, element) {
        var el = element[0];

        el.addEventListener('dragover', function (e) {
          e.dataTransfer.dropEffect = 'move';

          if (e.preventDefault) {
            e.preventDefault();
          }

          return false;
        }, false);

        el.addEventListener('drop', function (e) {
          // Stops some browsers from redirecting.
          if (e.stopPropagation) {
            e.stopPropagation();
          }

          var elementDropped = document.getElementById(e.dataTransfer.getData('id')),
            dropMethod = scope.droppable;

          // call the drop passed drop function
          if (typeof dropMethod === 'function') {
            scope.droppable(elementDropped, element[0], e);
          }

          return false;
        }, false);
      }
    };
  })
  .directive('textcomplete', ['Textcomplete', function(Textcomplete) {
    return {
      restrict: 'EA',
      scope: {
        columns: '=',
        message: '=',
        id: '@',
        name: '@',
        placeholder: '@',
        disabled: '='
      },
      template: '<textarea id="{{id}}" name="{{name}}" ng-model="message" type="text"  class="form-control code" msd-elastic ng-disabled="disabled" placeholder="{{placeholder}}"></textarea>',
      link: function(scope, iElement, iAttrs) {

        var cols = scope.columns;
        var codes = ['data'];
        var ta = iElement.find('textarea');
        var textcomplete = new Textcomplete(ta, [
          {
            match: /(^|\s)([\w\-]*)$/,
            search: function(term, callback) {
              callback($.map(cols, function(colName) {
                return colName.toLowerCase().indexOf(term.toLowerCase()) === 0 ? colName : null;
              }));
            },
            index: 2,
            replace: function(colName) {
              return '$1' + colName + '';
            }
          },
          {
            match: /(^|\s)#([\w\-]*)$/,
            search: function(term, callback) {
              callback($.map(codes, function(code) {
                return code.toLowerCase().indexOf(term.toLowerCase()) === 0 ? code : null;
              }));
            },
            index: 2,
            replace: function(code) {
              return '$1#' + code + '[';
            }
          }
        ]);

        $(textcomplete).on({
          'textComplete:select': function (e, value) {
            scope.$apply(function() {
              scope.message = value
            })
          },
          'textComplete:show': function (e) {
            $(this).data('autocompleting', true);
          },
          'textComplete:hide': function (e) {
            $(this).data('autocompleting', false);
          }
        });
      }
    }
  }])
  .directive('fdInfoBox', function () {
    return {
      restrict: 'AE',
      replace: true,
      transclude: true,
      scope: {
        info: '='
      },
      template: '\
        <div class="box box-default">\
          <div class="box-header with-border">\
            <h3 class="box-title">{{info.title}}</h3>\
            <ng-transclude></ng-transclude>\
          </div>\
          <div class="box-body">\
            <dl class="dl-horizontal">\
              <div ng-repeat="(k,v) in info.state">\
                <dt>{{k}}:</dt>\
                <dd>{{v}}</dd>\
              </div>\
            </dl>\
          </div>\
        </div>'
    };
  })
  .directive('fortressInput', ['QueryService', function (QueryService) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        model: '=',
        class: '@'
      },
      template: '<input type="text" class="form-control {{class}}" ng-model="model" placeholder="Data Provider" \
        uib-typeahead="f.name as f.name for f in fortresses | filter:$viewValue">',
      link: function (scope, element, attrs) {
        QueryService.general('fortress').then(function (data) {
          scope.fortresses = data;
        });
      }
    };
  }])
  .directive('doctypeInput', ['QueryService', function (QueryService) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        model: '=',
        class: '@',
        fortress: '=',
        onSelect: '&'
      },
      template: '<input type="text" class="form-control {{class}}" placeholder="Document Type" \
        ng-model="model" ng-focus="getDoctypes()" \
        uib-typeahead="d.name for d in documents | filter:$viewValue" typeahead-on-select="onSelect()">',
      link: function (scope, element, attrs) {
        scope.getDoctypes = function () {
          if (scope.fortress) {
            QueryService.doc(scope.fortress).then(function (data) {
              scope.documents = data;
            });
          }
        };
      }
    };
  }])
  .directive('tagInput', ['QueryService', function (QueryService) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        model: '=',
        class: '@',
        onSelect: '&'
      },
      template: '<input type="text" class="form-control {{class}}" placeholder="Label" \
          ng-model="model" ng-focus="getTags()" autocomplete="off" \
          uib-typeahead="t.label for t in tags | filter:$viewValue" typeahead-on-select="onSelect()">',
      link: function (scope, element, attrs) {
        scope.getTags = function () {
          QueryService.general('tag').then(function (data) {
            scope.tags = data;
          });
        };
      }
    };
  }])
  .directive('statsChart', ['$filter', function ($filter) {
    function chart(element, width, height, data) {
      var radius = Math.min(width, height) / 2,
          color = d3.scale.category20(),
          total = function() {return _.reduce(data, function (a, b) { return a+b; })},
          pie = d3.layout.pie()
            .sort(null)
            .value(function (d) { return d.value; }),

          svg, g, arc,

          object = {};

      object.render = function () {
        if (!svg) {
          arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - radius / 2);
          svg = element.append('svg')
            // .attr('width', width)
            // .attr('height', height)
            .attr('preserveAspectRatio', 'xMinYMid')
            .attr('viewBox', '0 0 '+width+' '+height)
            .classed("chart-content", true)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

          g = svg.selectAll('.arc')
            .data(pie(d3.entries(data)))
            .enter().append('g')
            .attr('class', 'arc');

          g.append('path')
            .each(function (d) {
              this._current = d;
            })
            .attr('d', arc)
            .style('fill', function (d) {
              return color(d.data.key);
            });
          g.append('text')
            .attr('transform', function (d) {
              return 'translate(' + arc.centroid(d) + ')';
            })
            .attr('dy', '.35em')
            .style('text-anchor', 'middle');
          g.select('text').text(function (d) {
            return d.data.key;
          });

          svg.append('text')
            .datum(data)
            .attr('x', 0)
            .attr('y', radius / 10)
            .attr('class', 'text-tooltip')
            .style('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .style('font-size', radius / 2.5 + 'px');

          svg.select('text.text-tooltip')
            .attr('fill', '#3c8dbc')
            .text($filter('megaNum')(total()));

          g.on('mouseover', function (obj) {
            svg.select('text.text-tooltip')
              .attr('fill', function (d) {
                return color(obj.data.key);
              })
              .text(function (d) {
                return $filter('megaNum')(d[obj.data.key]);
              });
          });

          g.on('mouseout', function (obj) {
            svg.select('text.text-tooltip')
              .attr('fill', '#3c8dbc')
              .text($filter('megaNum')(total()));
          });
        } else {
          g.data(pie(d3.entries(data))).exit().remove();

          g.select('path')
            .transition().duration(200)
            .attrTween('d', function (a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function (t) {
                return arc(i(t));
              };
            });

          g.select('text')
            .attr('transform', function (d) {
              return 'translate(' + arc.centroid(d) + ')';
            });

          svg.select('text.text-tooltip').datum(data);
        }
        return object;
      };

      object.data = function (value) {
        if (!arguments.length) return data;
        data = value;
        return object;
      };

      object.element = function(value){
        if (!arguments.length) return element;
        element = value;
        return object;
      };

      object.width = function(value){
        if (!arguments.length) return width;
        width = value;
        radius = Math.min(width, height) / 2;
        return object;
      };

      object.height = function(value){
        if (!arguments.length) return height;
        height = value;
        radius = Math.min(width, height) / 2;
        return object;
      };

      return object;
    }

    return {
      restrict: 'EA',
      scope: {
        data: '='
      },
      link: function (scope, element, attrs) {
        var width = 350, height = 350;
        var getData = function(dataSet){
          var data = {};
          _.map(dataSet, function (e) {
            data[e.key] = e.doc_count;
          });
          return data;
        };
        var statChart = chart(d3.select(element[0]), width, height, getData(scope.data)).render();

        scope.$watch('data', function (newVal, oldVal, scope) {
          if (!scope.data) return;
          statChart.data(getData(newVal)).render();
        }, true);
      }
    }
  }])
  .component('fortStat', {
    template: '<div class="col-sm-3 col-lg-2" ng-if="$ctrl.show">\
    <div class="box">\
      <div class="box-header with-border">\
        <h3 class="box-title">{{$ctrl.fortress.name}}</h3>\
        <div class="box-tools pull-right">\
          <button type="button" class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">\
          <i class="fa fa-minus"></i></button>\
          <button type="button" class="btn btn-box-tool" data-widget="remove" data-toggle="tooltip" title="Remove">\
          <i class="fa fa-times"></i></button>\
        </div>\
      </div>\
      <div class="box-body">\
        <stats-chart data="$ctrl.chartData"></stats-chart></div>\
      </div>\
    </div>',
    controller: ['QueryService', function FortStatCtrl(QueryService) {
      var ctrl = this;
      var payload = {
        'size': 0,
        'query': {
          'match_all': {}
        },
        'aggs' : {
          'count_by_type' : {
            'terms' : {
              'field' : '_type'
            }
          }
        }
      };

      ctrl.$onChanges = function (change) {
        if (change.fortress) {
          payload.fortress = ctrl.fortress.name;
        }
        if (change.search.currentValue) {
          ctrl.show = false;
          payload.query = {query_string: {query: ctrl.search}};
        }
        QueryService.query('es', payload).then(function (data) {
          if (data.hits.total>0) {
            ctrl.chartData = data.aggregations.count_by_type.buckets;
            ctrl.show = true;
          } else ctrl.show=false;
        });
      };
    }],
    bindings: {
      fortress: '<',
      search: '<'
    }
  })
  .component('fdSearch', {
    transclude: true,
    template: '<form class="panel" ng-submit="$ctrl.search()">\
        <div class="input-group">\
          <div class="input-group-btn">\
            <button type="submit" class="btn btn-primary">\
            <i class="fa fa-search"></i> View\
            </button>\
          </div>\
          <input type="search" class="form-control" value="*" placeholder="Select criteria before applying a filter ..." ng-model="$ctrl.req.searchText"\
                 size="100" autocomplete="on" autofocus/>\
        </div>\
        <div class="row" ng-transclude></div>\
      </form>',
    controller: ['MatrixRequest', function SearchCtrl(MatrixRequest) {
      this.req = MatrixRequest;
    }],
    bindings: {
      search: '&'
    }
  })
  .component('fdMatrixForm',{
    templateUrl: 'views/partials/matrix-form.html',
    transclude: true,
    controller: ['MatrixRequest', 'QueryService', function MatrixFormCtrl(MatrixRequest, QueryService) {
      var ctrl = this;
      ctrl.params = MatrixRequest;

      QueryService.general('fortress').then(function (data) {
        ctrl.params.fortresses = data;
      });

      ctrl.selectFortress = function (f) {
        ctrl.params.fortress = f;
        QueryService.doc(f).then(function (data) {
          ctrl.params.documents = data;
        });
        ctrl.params.concepts = [];
        ctrl.params.fromRlxs = [];
        ctrl.params.toRlxs = [];
      };
      ctrl.selectDocument = function (d) {
        ctrl.params.document = d;
        QueryService.concept('/', d).then(function (data) {
          var conceptMap = _.flatten(_.pluck(data, 'concepts'));
          ctrl.params.concepts = _.uniq(conceptMap, function (c) {
            return c.name;
          });
        });
        ctrl.params.fromRlxs = [];
        ctrl.params.toRlxs = [];
      };

      ctrl.selectAllFromRlx = function () {
        var filtered = filter(ctrl.params.fromRlxs);

        angular.forEach(filtered, function (item) {
          item.selected = true;
        });
      };

      ctrl.selectConcept = function (concept) {
        ctrl.params.concept = concept;
        QueryService.concept('/relationships', ctrl.params.document).then(function (data) {
          var conceptMap = _.filter(_.flatten(_.pluck(data, 'concepts')), function (c) {
            return _.contains(concept, c.name);
          });
          var rlxMap = _.flatten(_.pluck(conceptMap, 'relationships'));
          var rlx = _.uniq(rlxMap, function (c) {
            return c.name;
          });
          ctrl.params.fromRlxs = rlx;
          ctrl.params.toRlxs = rlx;
        });
      };
    }]
  });
// Directives
