import angular from 'angular';
import uiRouter from 'angular-ui-router';
import uiBootsrap from 'angular-ui-bootstrap';
import toastr from 'angular-toastr';
import 'ng-jsoneditor';
import agGrid from 'ag-grid';

import config from '../../config';
import services from '../../services';
import components from '../../components';

import {modelEditor} from './editor.component';
import ModelEditorConfig from './editor.config';
import DataSampleService from './data-sample.service';
import EditColdefModal from './edit-coldef-modal';

import {settingsTab} from './settings-tab/settings-tab.component';
import {structureTab} from './structure-tab/structure-tab.component';
import fileBox from './sample-tab/file-box.component';
import {sampleTab} from './sample-tab/sample-tab.component';
import {statsTab} from './stats-tab/stats-tab.component';
import {validateTab} from './validate-tab/validate-tab.component';

agGrid.initialiseAgGridWithAngular1(angular);
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/theme-blue.css';

export default angular
  .module('fd-view.cmeditor', [
    uiRouter,
    uiBootsrap,
    toastr,
    'ng.jsoneditor',
    'agGrid',

    config,
    services,
    components,
    EditColdefModal
  ])
  .component('modelEditor', modelEditor)
  .service('DataSample', DataSampleService)
  .component('settingsTab', settingsTab)
  .component('structureTab', structureTab)
  .directive('fileBox', fileBox)
  .component('sampleTab', sampleTab)
  .component('statsTab', statsTab)
  .component('validateTab', validateTab)
  .config(ModelEditorConfig)
  .name;
