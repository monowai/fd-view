import angular from 'angular';
import uiRouter from 'angular-ui-router';
import 'angular-ui-ace';
import angularMoment from 'angular-moment';

import config from '../../config';
import {viewEntityView} from './viewentity.component';
import EntityService from './entity.service';
import {fdJsondiff2} from './jsondiff.directive';
import fdJsonabview from './jsonabview.directive';
import ViewEntityConfig from './viewentity.config';

export default angular
  .module('viewEntity', [uiRouter, 'ui.ace', angularMoment, config])
  .component('viewEntity', viewEntityView)
  .service('EntityService', EntityService)
  .directive('fdJsondiff2', fdJsondiff2)
  .directive('fdJsonabview', fdJsonabview)
  .config(ViewEntityConfig)
  .name;
