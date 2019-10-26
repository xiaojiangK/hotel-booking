var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var cssnano = require('gulp-cssnano');
var header = require('gulp-header');
var autoprefixer = require('autoprefixer');
var pkg = require('./package.json');

gulp.task('watch', function() {
  gulp.watch('src/**', ['build:pages', 'build:utils', 'build:images']);
});
gulp.task('build:style', function() {
  var banner = [
    '/*!',
    ' * WeUI v<%= pkg.version %> (<%= pkg.homepage %>)',
    ' * Copyright <%= new Date().getFullYear() %> Tencent, Inc.',
    ' * Licensed under the <%= pkg.license %> license',
    ' */',
    ''
  ].join('\n');
  gulp
    .src(['src/style/**/*.wxss', 'src/pages/*.wxss'], { base: 'src' })
    .pipe(less())
    .pipe(postcss([autoprefixer(['iOS >= 8', 'Android >= 4.1'])]))
    .pipe(
      cssnano({
        zindex: false,
        autoprefixer: false,
        discardComments: { removeAll: true }
      })
    )
    .pipe(header(banner, { pkg: pkg }))
    .pipe(
      rename(function(path) {
        path.extname = '.wxss';
      })
    )
    .pipe(gulp.dest('dist'));
});
gulp.task('build:pages', function() {
  gulp
    .src(
      [
        'src/app.js',
        'src/app.json',
        'src/app.wxss',
        'src/pages/**'
      ],
      { base: 'src' }
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('build:utils', function() {
  gulp
    .src(
      [
        'src/utils/**'
      ],
      { base: 'src' }
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('build:images', function() {
  gulp
    .src(
      [
        'src/images/**'
      ],
      { base: 'src' }
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('compile:json', () => {
  return gulp.src(['src/**/*.json'])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.jsonminify())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['watch', 'build:pages', 'build:utils', 'build:images']);
