export default class RootCtrl {
  /** @ngInject */
  constructor($state, User) {
    this._state = $state;
    this._user = User;
  }

  isLogin() {
    return this._state.is('login');
  }

  authenticated() {
    return this._user.authenticated;
  }
}
