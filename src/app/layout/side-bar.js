import template from './side-bar.html';

class SideBar {
  /** @ngInject */
  constructor(User) {
    this.profile = User.account;
  }
}

export const sideBar = {
  template,
  controller: SideBar
};
