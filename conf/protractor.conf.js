exports.config = {
  capabilities: {
    browserName: 'chrome',

    chromeOptions: {
      args: ["--headless", "--disable-gpu", "--window-size=800x600"]
    }
  },

  baseUrl: 'http://localhost:9000',
  framework: 'jasmine2',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  rootElement: 'html',

  // Additional parameters to use in test suites
  params: {
    login: {
      user: 'test',
      password: 'test'
    }
  }
};
