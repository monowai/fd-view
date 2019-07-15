import angular from 'angular';
import authInterceptor from 'angular-http-auth';
import uiBootstrap from 'angular-ui-bootstrap';
import Session from './session.service';
import User from './user.service';
import AuthenticationSharedService from './authentication-shared.service';
import QueryService from './query.service';
import MatrixRequest from './matrix-request.service';
import ModalService from './modal.service';
// import 'ngprogress/build/ngProgress'; // requires fixing
// import 'ngprogress/ngProgress.css';

/** @ngInject */
export default // .service('interceptorNgProgress', InterceptorNgProgress)
angular
  .module('fd-view.services', [authInterceptor, uiBootstrap])
  .service('Session', Session)
  .service('User', User)
  .service('AuthenticationSharedService', AuthenticationSharedService)
  .service('QueryService', QueryService)
  .service('MatrixRequest', MatrixRequest)
  .service('modalService', ModalService).name;
