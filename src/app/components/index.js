import angular from 'angular';
import uiBootstrap from 'angular-ui-bootstrap';

import cytoscape from 'cytoscape';
import cyedgehandles from 'cytoscape-edgehandles';
import cyqtip from 'cytoscape-qtip';
import cydagre from 'cytoscape-dagre';
import services from '../services';

import {contains, notEmpty, megaNum} from './filters';
import autofocus from './autofocus.directive';
import ngHeight from './ng-height.directive';
import {fdSearch} from './fd-search.component';
import ConceptModal from './concept-modal.service';
import {cytoscapeComponent} from './cytoscape.component';
import {fortressInput} from './fortress-input.component';
import {doctypeInput} from './doctype-input.component';

import './components.scss';

export default angular
  .module('fd-view.shared', [uiBootstrap, services])
  .filter('contains', contains)
  .filter('notEmpty', notEmpty)
  .filter('megaNum', megaNum)
  .directive('ngHeight', ngHeight)
  .directive('autofocus', autofocus)
  .component('fdSearch', fdSearch)
  .component('cytoscape', cytoscapeComponent)
  .component('fortressInput', fortressInput)
  .component('doctypeInput', doctypeInput)
  .service('ConceptModal', ConceptModal)
  .run(() => {
    cyedgehandles(cytoscape);
    cyqtip(cytoscape);
    cydagre(cytoscape);
  })
  .name;
