exports.config = {
  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': require('phantomjs-prebuilt').path
  },

  baseUrl: 'http://localhost:9000',
  framework: 'jasmine2',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  // Additional parameters to use in test suites
  params: {
    login: {
      user: 'test',
      password: 'test'
    }
  }
};
