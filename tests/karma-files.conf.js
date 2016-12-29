const conf = require('./../conf/gulp.conf.js'),
  wiredep = require('wiredep');

module.exports = function listFiles() {

  const wiredepOptions = Object.assign({},
    conf.wiredep, {
      dependencies: true,
    devDependencies: true
  });

  const patterns = wiredep(wiredepOptions).js.concat([
    'node_modules/babel-polyfill/browser.js',
    conf.path.tmp('index.html'),
    conf.path.tmp('**/*.js'),
    conf.path.src('**/*.html')
  ]);

  const files = patterns.map(pattern => ({pattern}));
  files.push({
    pattern: conf.path.src('app/**/*'),
    included: false,
    served: true,
    watched: false
  });
  return files;
};
