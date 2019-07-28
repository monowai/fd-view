import angular from 'angular';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';

import './search.scss';

import config from '../config';
import services from '../services';
import components from '../components';
import viewEntity from './viewEntity';
import { searchView } from './search.component';
import SearchService from './search.service';
import cleanCode from './clean-code.filter';
import SearchConfig from './search.config';

import { react2angular } from '../services/angular-react-helper';
import FdSearchForm from '../search/fd-search-form.react';
import FdSearchResults from './fd-search-results.react';

/** @ngInject */
export default angular
  .module('fd-view.search', [uiRouter, uiBootstrap, config, services, components, viewEntity])
  .component('searchView', searchView)
  .component('fdSearchForm', react2angular(FdSearchForm))
  .component('fdSearchResults', react2angular(FdSearchResults))
  .factory('SearchService', SearchService)
  .filter('cleanCode', cleanCode)
  .config(SearchConfig).name;
