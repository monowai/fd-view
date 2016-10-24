const conf = require('./gulp.conf');

module.exports = function () {
  return {
    server: {
      baseDir: [
        conf.paths.tmp,
        conf.paths.src
      ],
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    ghostMode: false, // comment out to sync tabs, views and devices
    port: 9000,
    open: 'local'
  };
};
