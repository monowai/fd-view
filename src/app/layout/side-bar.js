class SideBar {
  /** @ngInject */
  constructor(User) {
    this.profile = User.account;
  }
}

angular
  .module('fd-view')
  .component('sideBar', {
    templateUrl: 'app/layout/side-bar.html',
    controller: SideBar
  });
