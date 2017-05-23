import angular from 'angular';

import {fortStat} from './fort-stat.component';
import {statsView} from './statistics.component';
import statsChart from './stat-chart.directive';
import StatsConfig from './statistics.config';

import './statistics.scss';

export default angular
  .module('fd-view.statistics', [])
  .component('statsView', statsView)
  .component('fortStat', fortStat)
  .directive('statsChart', statsChart)
  .config(StatsConfig)
  .name;
