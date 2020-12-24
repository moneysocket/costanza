'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var log = require('gulplog');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var tailwindcss = require('tailwindcss');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');


///////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function () {
  return gulp.src(['htdocs/js/*.js', 'htdocs/js/*.map'], {read: false})
    .pipe(clean());
});

///////////////////////////////////////////////////////////////////////////////

gulp.task('style', function () {
    return gulp.src('src/style.css').pipe(
        postcss([tailwindcss("src/tailwind.js"), autoprefixer])).pipe(
        gulp.dest("htdocs/css"));
});

gulp.task('copyHtml', function copyHtml(cb) {
    gulp.src('src/*.html').pipe(gulp.dest('htdocs'));
    cb();
});

gulp.task('copyMisc', function copyMisc(cb) {
    gulp.src('src/js/qr-scanner-worker.min.js').pipe(gulp.dest('htdocs/js/'));
    gulp.src('src/js/qr-scanner-worker.min.js.map').pipe(gulp.dest('htdocs/js/'));
    gulp.src('src/browserconfig.xml').pipe(gulp.dest('htdocs/'));
    gulp.src('src/webfonts/*').pipe(gulp.dest('htdocs/webfonts'));
    gulp.src('src/img/*').pipe(gulp.dest('htdocs/img'));
    gulp.src('src/icons/*').pipe(gulp.dest('htdocs/icons'));
    gulp.src('src/css/*').pipe(gulp.dest('htdocs/css'));
    cb();
});

///////////////////////////////////////////////////////////////////////////////

gulp.task('walletQuick', function () {
    var b = browserify({
      entries: './src/js/app.js',
      debug: true
    });

    return b.bundle()
      .pipe(source('./app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./htdocs/js/'));
});

gulp.task('quick', gulp.series([
                               'clean',
                               'style',
                               'copyMisc',
                               'copyHtml',
                               'walletQuick',
                               ]));

gulp.task('quick_watch', function () {
    gulp.watch("src/**/*" , { ignoreInitial: false },
               gulp.series(['clean',
                            'style',
                            'copyMisc',
                            'copyHtml',
                            'walletQuick',
                            ]));
});

gulp.task('js', gulp.series(['copyHtml',
                             'copyMisc',
                             'walletQuick']));

gulp.task('js_watch', function () {
    gulp.watch("src/**/*" , { ignoreInitial: false },
               gulp.series([
                            'copyHtml',
                             'copyMisc',
                            'walletQuick',
                            ]));
});
