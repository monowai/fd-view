describe('Login', () => {
  const user = browser.params.login;
  const MockAPI = require('./mock-api');

  beforeEach(() => {
    browser.driver.manage().window().setSize(1280, 1024);
    browser.addMockModule('fdApiMock', MockAPI);
    browser.sleep(2000);
  });

  it('should display Welcome page', () => {
    browser.get('/');
    expect(element(by.tagName('h1')).getText()).toEqual('Welcome');
  });

  // it('should be able to login', () => {
  //   element(by.model('$ctrl.username')).sendKeys(user.user);
  //   element(by.model('$ctrl.password')).sendKeys(user.password, protractor.Key.ENTER);
  //   // element(by.buttonText('Sign In')).click();
  //   browser.wait(element(by.tagName('h1')).isPresent);
  // });

  it('should display user name', () => {
    expect(element(by.binding('profile.name')).isPresent()).toBe(true);
    expect(element(by.binding('profile.companyName')).isPresent()).toBe(true);
    // browser.sleep(1000);
  });

  it('should display Search page', () => {
    browser.get('/search');
    expect(element(by.tagName('fd-search')).isPresent()).toBe(true);
  });

});
