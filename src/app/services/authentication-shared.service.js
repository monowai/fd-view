export default class AuthenticationSharedService {
  /** @ngInject */
  constructor($rootScope, $http, authService, Session, User, configuration) {
    this._rootScope = $rootScope;
    this._http = $http;
    this._authService = authService;
    this._session = Session;
    this._user = User;
    this._cfg = configuration;
  }

  login(username, password) {
    const userData = { username, password };
    const url = `${this._cfg.engineUrl()}/api/login`;
    return this._http.post(url, userData).then(
      res => {
        this._session.create(res.data);
        this._user.account = this._session;
        this._authService.loginConfirmed(res.data);
        return res.data;
      },
      () => {
        // this._rootScope.authenticationError = true;
        this._session.invalidate();
      }
    );
  }

  valid(authorizedRoles) {
    if (!this._session.login) {
      this.getMyProfile().then(data => {
        this._session.create(data);
        this._user.account = this._session;
        this._user.authenticated = true;
      });
    }
    if (this._session.login && !this._user.isAuthorized(authorizedRoles)) {
      // user is not allowed
      this._rootScope.$broadcast('event:auth-notAuthorized');
    }
    this._user.authenticated = Boolean(this._session.login);
  }

  isAuthorized(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      if (authorizedRoles === '*') {
        return true;
      }
      authorizedRoles = [authorizedRoles];
    }

    let isAuthorized = false;
    authorizedRoles.forEach(authorizedRole => {
      const authorized = this.authenticated && this.account.userRoles.includes(authorizedRole); // originally Session.login, this assigned to UserService

      if (authorized || authorizedRole === '*') {
        isAuthorized = true;
      }
    });

    return isAuthorized;
  }

  getMyProfile() {
    return this._http.get(`${this._cfg.engineUrl()}/api/account`).then(
      response => {
        return response.data;
      },
      response => {
        this._rootScope.$broadcast('event:auth-loginRequired', response);
      }
    );
  }

  logout() {
    // this._rootScope.authenticationError = false;
    this._user.authenticated = false;
    this._user.account = null;

    this._http.get(`${this._cfg.engineUrl()}/logout`);
    this._session.invalidate();
    this._authService.loginCancelled();
  }
}
