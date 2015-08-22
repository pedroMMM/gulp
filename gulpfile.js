var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

gulp.task('vet', function () {
    return gulp
        .src([
            './src/**/*.js',
            './*.js'
        ])
        .pipe(jscs())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }));
});
