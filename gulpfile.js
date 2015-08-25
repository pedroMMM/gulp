var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-Sync');
var config = require('./gulp.config')();
var del = require('del');
var wiredep = require('wiredep').stream;
var port = process.env.PORT || config.defaultPort;
var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('help', $.taskListing);

gulp.task('default', ['help']);

gulp.task('vet', function () {
    log('Analyzing source with JSHint and JSCS');
    return gulp
        .src(config.alljs)
        .pipe($.plumber())
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

gulp.task('styles-browser-sync', ['clean-styles'], function () {
    log('Compileing less --> CSS');
    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: ['> 2%']
        }))
        .pipe(gulp.dest(config.tmp))
        .pipe(browserSync.stream());
});

gulp.task('clean-styles', function (cb) {
    log('Cleaing styles');
    var files = [config.tmp + '**/*.css'];
    clean(files, cb);
});

gulp.task('less-watcher', function () {
    //    gulp.watch(config.less, ['styles']);

    gulp.watch(config.less, ['styles'])
        .on('change', function (event) {
            changeEvent(event);
        });
});

gulp.task('wiredep', function () {
    log('Wire up the bower css, js and our js into the html');
    var options = config.getDefaultWiredepOptions();

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles'], function () {
    log('Wire up our css into the html and call wiredep');

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('serve-dev', ['inject'], function () {
    serve(true);
});

gulp.task('serve-build', ['optimize'], function () {
    serve(false);
});

gulp.task('fonts', ['clean-fonts'], function () {
    log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe($.plumber())
        .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('clean-fonts', function (cb) {
    log('Cleaing fonts folder');

    var files = [config.build + 'fonts/'];
    clean(files, cb);
});

gulp.task('images', ['clean-images'], function () {
    log('Copying and compressing images');

    return gulp
        .src(config.images)
        .pipe($.plumber())
        .pipe($.imagemin({
            optimizationLevel: 4
        }))
        .pipe(gulp.dest(config.build + 'images'));
});

gulp.task('clean-images', function (cb) {
    log('Cleaing images folder');

    var files = [config.build + 'images/'];
    clean(files, cb);
});

gulp.task('clean-code', function (cb) {
    log('Cleaing code from build and tmp folders');

    var files = [].concat(
        config.build + '**/*.html',
        config.build + 'js/**/*.js',
        config.tmp + '**/*.js'
    );
    clean(files, cb);
});

gulp.task('clean', function (cb) {
    log('Cleaing build and tmp folders');

    var files = [].concat(config.build, config.tmp);
    clean(files, cb);
});

gulp.task('templatecache', ['clean-templatecache'], function () {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.plumber())
        .pipe($.minifyHtml({
            empty: true
        }))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('clean-templatecache', function (cb) {
    log('Cleaing template cache file');

    var files = [config.tmp + config.templateCache.file];
    clean(files, cb);
});

gulp.task('optimize', ['clean', 'inject', 'templatecache'], function () {
    log('Optimizing the js, css, html and inject them on the build index');

    var templateCache = config.tmp + config.templateCache.file;

    var assets = $.useref.assets({
        searchPath: './'
    });

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {
            read: false
        }), {
            starttag: '<!--    inject:templates:js   -->'
        }))
        .pipe(assets)
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest(config.build));
});

/*
 * Generic methods
 */

function serve(isDev) {

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', function (ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function () {
                browserSync.notify('Realoading now ...');
                browserSync.reload({
                    stream: false
                });
            }, config.browserReloadDelay);
        })
        .on('start', function () {
            log('*** nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function () {
            log('*** nodemon crached');
        })
        .on('exit', function () {
            log('*** nodemon exited cleanly');
        });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(isDev) {
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch(config.less, ['styles-browser-sync'])
            .on('change', function (event) {
                changeEvent(event);
            });
    } else {

        var watch = [
            config.less,
            config.js,
            config.html
        ];

        var dependencies = [
            'optimize',
            browserSync.reload
        ];

        gulp.watch(watch, dependencies)
            .on('change', function (event) {
                changeEvent(event);
            });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.allclient,
            '!' + config.allless,
            '!' + config.allcss
            /* I had to remove ./ from the path because browser-sync */
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChaanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 2000,
        browser: ['chrome', 'google chrome'],
        open: true
    };

    browserSync(options);
}

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
