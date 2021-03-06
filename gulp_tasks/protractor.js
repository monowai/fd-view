const path = require('path');
const conf = require('../conf/gulp.conf');

const gulp = require('gulp');
const protractor = require('gulp-protractor').protractor;

const browserSync = require('browser-sync');

gulp.task('webdriver-update', require('gulp-protractor').webdriver_update);
gulp.task('e2e:run', protractorRun);

function protractorRun(done) {
  const configFile = path.join(process.cwd(), 'conf', 'protractor.conf.js');

  const params = process.argv;
  const args = params.length > 3 ? [params[3], params[4]] : [];

  return gulp.src(path.join(conf.paths.e2e, '/**/*.js'))
    .pipe(protractor({
      configFile,
      args
    }))
    .on('error', err => {
      throw err;
    })
    .on('end', () => {
      browserSync.exit();
      done();
      process.exit();
    });
}
