var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var series = gulp.series;
var parallel = gulp.parallel;
var watch = gulp.watch;

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

function vendorBootstrap() {
  return gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'));
}

function vendorFontAwesome() {
  return gulp.src([
      './node_modules/font-awesome/**/*',
      '!./node_modules/font-awesome/{less,less/*}',
      '!./node_modules/font-awesome/{scss,scss/*}',
      '!./node_modules/font-awesome/.*',
      '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
    .pipe(gulp.dest('./vendor/font-awesome'));
}

function vendorJquery() {
  return gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
}

function vendorJqueryEasing() {
  return gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-easing'));
}

function vendorSimpleLineIconsFonts() {
  return gulp.src([
      './node_modules/simple-line-icons/fonts/**'
    ])
    .pipe(gulp.dest('./vendor/simple-line-icons/fonts'));
}

function vendorSimpleLineIconsCss() {
  return gulp.src([
      './node_modules/simple-line-icons/css/**'
    ])
    .pipe(gulp.dest('./vendor/simple-line-icons/css'));
}

function cssCompile() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
}

function cssMinify() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
}

function jsMinify() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
}

function browserSyncTask(done) {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  done();
}

function watchFiles() {
  watch('./scss/**/*.scss', css);
  watch('./js/**/*.js', js);
  watch('./*.html').on('change', browserSync.reload);
}

var vendor = parallel(
  vendorBootstrap,
  vendorFontAwesome,
  vendorJquery,
  vendorJqueryEasing,
  vendorSimpleLineIconsFonts,
  vendorSimpleLineIconsCss
);
var css = series(cssCompile, cssMinify);
var js = series(jsMinify);
var dev = series(css, js, browserSyncTask, watchFiles);
var build = series(css, js, vendor);

exports.vendor = vendor;
exports.css = css;
exports.js = js;
exports.dev = dev;
exports.default = build;
