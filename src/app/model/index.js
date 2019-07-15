import angular from 'angular';
import uiRouter from 'angular-ui-router';

import config from '../config';
import services from '../services';
import modelEditor from './editor';
import {modelView} from './model.component';
import ContentModelService from './content-model.service';
import ModelConfig from './model.config';

/** @ngInject */
export default angular
  .module('fd-view.modeler', [uiRouter, config, services, modelEditor])

  .component('modelView', modelView)
  .service('ContentModel', ContentModelService)
  .config(ModelConfig)
  .run(() => {
    /* agGrid module initialized */
    // agGrid.initialiseAgGridWithAngular1(angular);
  }).name;
