import angular from 'angular';
import uiRouter from 'angular-ui-router';

import services from '../services';
import RootCtrl from './root.controller';
import {infoFooter} from './footer.component';
import {navBar} from './nav-bar';
import {sideBar} from './side-bar';
import {fdMatrixForm} from './matrix-form.component';

import './layout.scss';

export default angular.module('fd-view.layout', [uiRouter, services])
  .controller('RootCtrl', RootCtrl)
  .component('infoFooter', infoFooter)
  .component('navBar', navBar)
  .component('sideBar', sideBar)
  .component('fdMatrixForm', fdMatrixForm)
  .name;
