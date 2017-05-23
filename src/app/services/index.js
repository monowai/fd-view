import angular from 'angular';
import authInterceptor from 'angular-http-auth';
import uiBootstrap from 'angular-ui-bootstrap';
// import 'ngprogress/build/ngProgress'; // requires fixing
// import 'ngprogress/ngProgress.css';

import Session from './session.service';
import User from './user.service';
import AuthenticationSharedService from './authentication-shared.service';
import QueryService from './query.service';
import MatrixRequest from './matrix-request.service';
import ModalService from './modal.service';
import InterceptorNgProgress from './interceptor-ng-progress.service';

export default angular
  .module('fd-view.services', [authInterceptor, uiBootstrap])
  .service('Session', Session)
  .service('User', User)
  .service('AuthenticationSharedService', AuthenticationSharedService)
  .service('QueryService', QueryService)
  .service('MatrixRequest', MatrixRequest)
  .service('modalService', ModalService)
  // .service('interceptorNgProgress', InterceptorNgProgress)
  .name;
