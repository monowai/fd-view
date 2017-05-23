import angular from 'angular';
import uiRouter from 'angular-ui-router';
import toastr from 'angular-toastr';

import services from '../services';
import config from '../config';
import layout from '../layout';

import {exploreView} from './explore.component';
import ExploreConfig from './explore.config';

import './explore.scss';

export default angular
  .module('fd-view.explore', [uiRouter, toastr, services, config, layout])
  .component('exploreView', exploreView)
  .config(ExploreConfig)
  .name;
