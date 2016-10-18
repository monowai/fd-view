class CytoscapeController {
  /** @ngInject */
  constructor($timeout, $element, $scope) {
    this._timeout = $timeout;
    this._element = $element;
    this._scope = $scope;
  }

  $onChanges(change) {
    const ctrl = this;
    let safe = true;
    _.each(change, el => {
      if (!el) {
        safe = false;
      }
    });
    const elements = this.elements;
    const style = this.styles;
    const layout = this.layout;

    if (safe) {
      cytoscape({
        container: this._element[0].firstChild,
        elements,
        style,
        layout,
        boxSelectionEnabled: true,
        motionBlur: false,
        wheelSensitivity: 0.2,
        ready: onReady
      });
    }

    function onReady() {
      const cy = this;
      // Run layout after add new elements
      const runLayout = addedElements => {
        if (addedElements) {
          layout.maxSimulationTime = 10;
          layout.fit = false;
          const addLayout = addedElements.makeLayout(layout);
          addLayout.pon('layoutstop')
            .then(event => {
              layout.maxSimulationTime = 2000;
              cy.elements().makeLayout(layout).run();
            }).run();
          // addLayout;
        }
      };

      // the default values for edgehandles plugin:
      const defaults = {
        preview: false, // whether to show added edges preview before releasing selection
        stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
        handleSize: 10, // the size of the edge handle put on nodes
        handleColor: '#ff0000', // the colour of the handle and the line drawn from it
        handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
        handleLineWidth: 1, // width of handle line in pixels
        handleIcon: false, // Pass an Image-object to use as icon on handle. Icons are resized according to zoom and centered in handle
        handleNodes: 'node[type!="alias"]', // selector/filter function for whether edges can be made from a given node
        hoverDelay: 150, // time spend over a target node before it is considered a target selection
        cxt: true, // whether cxt events trigger edgehandles (useful on touch)
        enabled: Boolean(ctrl.onEdge), // whether to start the extension in the enabled state
        toggleOffOnLeave: false, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
        edgeType: (sourceNode, targetNode) => {
          // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
          // returning null/undefined means an edge can't be added between the two nodes
          return 'flat';
        },
        // for the specified node, return whether edges from itself to itself are allowed
        loopAllowed: node => false,
        nodeLoopOffset: -50, // offset for edgeType: 'node' loops

        complete: (sourceNode, targetNode, addedEntities) => {
          // fired when edgehandles is done and entities are added
          ctrl.onEdge({source: sourceNode[0]._private.data,
            target: targetNode[0]._private.data});
        }
      };

      cy.edgehandles(defaults);

      // QTip
      cy.elements().qtip({
        content: ctrl.qtip, // function(){ return this[0]._private.data.code },
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
      cy.on('tap', event => {
        if (event.cyTarget === cy) {
          ctrl._timeout(() => {
            ctrl.selectedNodes = [];
          }, 10);
        } else {
          ctrl._timeout(() => {
            ctrl.selectedNodes = cy.$(':selected');
          }, 10);
        }
      });
      // cy.on('tap', 'node', function (event) {
      //   console.log(event.cyTarget.data());
      //   scope.$apply(function () {
      //     scope.selectedNodes.push(event.cyTarget.data());
      //   });
      // });
      // Mouseout
      cy.on('mouseout', () => {
        cy.elements().removeClass('mouseover');
        cy.elements().removeClass('edge-related');
      });
      // Mouseover
      cy.on('mouseover', event => {
        const target = event.cyTarget;
        if (target !== event.cy) {
          target.addClass('mouseover');
          target.neighborhood().edges()
            .addClass('edge-related');
        }
      });
      cy.on('cxttapstart', 'node', event => {
        // console.log(event);
      });
      cy.on('mouseup', event => {
        // console.log(event);
      });
      cy.on('drop', event => {
        // console.log(event);
      });

      // // Add elements
      ctrl._scope.$on('cytoscapeAddElements', (event, data) => {
        const addElements = data.elements;
        const addedElements = cy.add(addElements);
        runLayout(addedElements);
        // scope.onChange(cy, data.forceApply);
      });
      // Delete elements
      ctrl._scope.$on('cytoscapeDeleteElements', (event, data) => {
        const deleteElements = data.elements;
        try {
          cy.remove(deleteElements);
        } catch (exception) {
          deleteElements.forEach(el => {
            cy.remove(cy.$(`#${deleteElements[i].data.id}`));
          });
        }
        ctrl.onChange(cy, data.forceApply);
      });
      ctrl._scope.$on('cytoscapeReset', event => {
        cy.resize();
        if (ctrl.elements.nodes.length > 1) {
          cy.fit(elements, 15);
        } else {
          cy.fit(elements, cy.width() / 5);
        }
      });
      ctrl._scope.$on('cytoscapeFitOne', () => {
        cy.fit(elements, cy.width() / 5);
      });
      ctrl._scope.$on('dropped', (event, data) => {
        // console.log('dropped', event);
      });
      // Filter nodes by name
      ctrl._scope.$watch('highlightByName', name => {
        cy.elements().addClass('searched');
        if (name && name.length) {
          const cleanName = name.toLowerCase().trim();
          const doHighlight = (i, node) => {
            const currentName = node.data().name.toLowerCase()
              .trim();
            if (currentName.includes(cleanName)) {
              node.removeClass('searched');
            }
          };
          cy.nodes().each(doHighlight);
        } else {
          cy.elements().removeClass('searched');
        }
      });
      // Navigator
      if (ctrl.navigatorContainerId) {
        cy.navigator({
          container: angular.element(ctrl.navigatorContainerId)
        });
      }
      // Context menu
      if (ctrl.contextMenuCommands) {
        cy.cxtmenu({
          menuRadius: 75,
          indicatorSize: 17,
          activePadding: 10,
          selector: 'node',
          commands: ctrl.contextMenuCommands
        });
      }
      // On complete
      if (ctrl.onComplete) {
        ctrl.onComplete({
          graph: cy,
          layout
        });
      }
    }
  }
}

angular
  .module('fd-view')
  .component('cytoscape', {
    template: '<div id="cy" ng-height="180"></div>',
    controller: CytoscapeController,
    bindings: {
      elements: '<',
      styles: '<',
      layout: '<',
      selectedNodes: '=?',
      highlightByName: '=',
      onComplete: '&',
      onChange: '&',
      nodeClick: '&',
      navigatorContainerId: '@',
      contextMenuCommands: '<',
      onEdge: '&',
      qtip: '<'
    }
  });
