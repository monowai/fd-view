import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'admin-lte/dist/css/AdminLTE.css';
import 'admin-lte/dist/css/skins/skin-blue.css';
import 'angular-toastr/dist/angular-toastr.css';

import 'bootstrap';
import 'admin-lte';

import angular from 'angular';
import ngCookies from 'angular-cookies';
// import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import uiRouter from 'angular-ui-router';
import toastr from 'angular-toastr';
import ngAnimate from 'angular-animate';

import layout from './app/layout';
import config from './app/config';
import services from './app/services';
import authView from './app/auth';
import settingsView from './app/settings';
import sharedComponents from './app/components';
import searchView from './app/search';
import analyzeView from './app/analyze';
import exploreView from './app/explore';
import modelView from './app/model';
import statsView from './app/statistics';
import adminView from './app/admin';

import appConfig from './app/config/fd-view.config';
import appRun from './app/config/fd-view.run';

angular
  .module('fd-view', [
    ngCookies,
    // ngResource, // not used
    ngSanitize,
    ngAnimate,
    uiRouter,
    toastr,
    config,
    services,
    layout,
    authView,
    settingsView,
    sharedComponents,
    searchView,
    analyzeView,
    exploreView,
    modelView,
    statsView,
    adminView
    // 'ngProgress', // requires fixing
    // 'sticky', // not used atm
  ])
  .config(appConfig)
  .run(appRun);

