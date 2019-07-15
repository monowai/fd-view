import angular from 'angular';
import uiBootstrap from 'angular-ui-bootstrap';

import configuration from '../config';
import services from '../services';

import {adminView} from './admin.component';
import {adminLanding} from './landing.component';
import {adminFortress} from './fortress-admin.component';
import {adminUser} from './user-admin.component';
import {fdInfoBox} from './fd-info-box.component';
import AdminConfig from './admin.config';

import JsonView from 'react-json-view';
import {react2angular} from 'react2angular';

/** @ngInject */
export default angular
  .module('fd-view.admin', [uiBootstrap, configuration, services])
  .component('adminView', adminView)
  .component('adminLanding', adminLanding)
  .component('adminFortress', adminFortress)
  .component('adminUser', adminUser)
  .component('fdInfoBox', fdInfoBox)
  .component(
    'jsonView',
    react2angular(JsonView, ['src', 'name', 'displayObjectSize', 'displayDataTypes'])
  )
  .config(AdminConfig).name;
