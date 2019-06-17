'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var concatCss = require('gulp-concat-css');
var notify = require("gulp-notify");
var browserSync = require('browser-sync').create();

// Location

var location = {
    source: {
        scss: 'public/scss/**/*.scss',
        bootstrap : 'node_modules/bootstrap-sass/assets/stylesheets'
    },
    dest: {
        css: 'public/css'
    }
};

// Exceptions

var handleError = function(task, err) {
    return function() {
        gutil.beep();
        gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
    };
};

var handleSucess = function(task) {
    return function() {
        gutil.log(gutil.colors.magenta('====== ' + task + ' => success ! ======'));
    };
};

// TASK

var task = {
    sass : function () {
        return gulp.src(location.source.scss)
            .pipe(sourcemaps.init())
            .pipe(sass({
                includePaths: [
                    location.source.bootstrap
                ],
                sourceComments: false,
                outputStyle: 'compressed'
            }))
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write({
                includeContent: false
            }))
            .pipe(gulp.dest(location.dest.css))
            // minify CSS
            .pipe(sourcemaps.init({
                'loadMaps': true
            }))
            .pipe(cleanCSS({debug: true}, function(details) {
                console.log('File to minify : ' + details.name + ' - ' + details.stats.originalSize + 'o => ' + details.stats.minifiedSize + 'o');
            }))
            .pipe(sourcemaps.write({
                includeContent: false
            }))
            .pipe(autoprefixer())
            .pipe(concatCss('all.min.css'))
            .pipe(gulp.dest(location.dest.css))
            .pipe(notify("SASS Compiled !"))
            .pipe(browserSync.reload({stream: true}))
            .on('end', handleSucess('SASS/CSS TASK'));
    }
};

gulp.task('sass', task.sass);


gulp.task('browser-sync', ['sass'], function() {
    browserSync.init({
        proxy: {
            target: "localhost:8080",
            ws: true
        }
    });
});

gulp.task('serve', ['browser-sync'], function () {
    gulp.watch("./public/css/scss/**/*.scss", ['sass']);
    gulp.watch("*.html").on('change', browserSync.reload);
});
