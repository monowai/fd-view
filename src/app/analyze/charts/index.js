import angular from 'angular';

import services from '../../services';

import {chordDiagram} from './chord-chart.component';
import biPartite from './bipartite.factory';
import {bipartiteDiagram} from './bipartite-chart.component';
import cooccurrenceDiagram from './cooccurrence-chart.directive';
import tagCloud from './tag-cloud.directive';
import barChart from './bar-chart.directive';

import './fd-charts.scss';

export default angular
  .module('fd-view.diagrams', [services])
  .component('chordDiagram', chordDiagram)
  .factory('BiPartiteService', biPartite)
  .component('bipartiteDiagram', bipartiteDiagram)
  .directive('cooccurrenceDiagram', cooccurrenceDiagram)
  .directive('tagCloud', tagCloud)
  .directive('barChart', barChart).name;
