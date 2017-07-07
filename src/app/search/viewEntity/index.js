import angular from 'angular';
import uiRouter from 'angular-ui-router';

import config from '../../config';
import {viewEntityView} from './viewentity.component';
import EntityService from './entity.service';
import ViewEntityConfig from './viewentity.config';

import {react2angular} from '../../services/angular-react-helper';
import EntityView from './entity-view.react';

export default angular
  .module('viewEntity', [uiRouter, config])
  .component('viewEntity', viewEntityView)
  .component('entityView', react2angular(EntityView))
  .service('EntityService', EntityService)
  .config(ViewEntityConfig)
  .name;
