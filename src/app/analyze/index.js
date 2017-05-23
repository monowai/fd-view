import angular from 'angular';
import uiRouter from 'angular-ui-router';
import toastr from 'angular-toastr';

import services from '../services';
import config from '../config';
import layout from '../layout';
import components from '../components';
import charts from './charts';

import {analyzeView} from './analyze.component';
import AnalyzeConfig from './analyze.config';
import {fdAggForm} from './agg-form.component';

export default angular
  .module('fd-view.analyze', [uiRouter, toastr, services, config, layout, components, charts])
  .component('analyzeView', analyzeView)
  .component('fdAggForm', fdAggForm)
  .config(AnalyzeConfig)
  .name;
