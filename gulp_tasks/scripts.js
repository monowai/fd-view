const gulp = require('gulp');
const eslint = require('gulp-eslint');

const babel = require('gulp-babel');
const conf = require('../conf/gulp.conf');

gulp.task('scripts', scripts);

function scripts() {
  return gulp.src(conf.path.src('**/*.js'))
    .pipe(eslint())
    .pipe(eslint.format())

    .pipe(babel()) // comment out to let browser to parse ES6
    .pipe(gulp.dest(conf.path.tmp()));
}
