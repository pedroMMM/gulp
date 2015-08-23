var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('vet', function () {
    log('Analyzing source with JSHint and JSCS');
    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function () {
    log('Compileing less --> CSS');
    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: ['> 2%']
        }))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('clean-styles', function (cb) {
    var files = [config.tmp + '**/*.css'];
    clean(files, cb);
});

gulp.task('less-watcher', function () {
    gulp.watch(config.less, ['styles']);
});

gulp.task('wiredep', function () {
    var options = config.getDefaultWiredepOptions();

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

/*
 * Generic methods
 */

function clean(path, cb) {
    log('Cleaing: ' + $.util.colors.blue(path));
    del(path, cb);
}

function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
