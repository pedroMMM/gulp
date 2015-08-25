module.exports = function () {

    var root = './';

    var client = './src/client/';

    var clientApp = client + 'app/';

    var server = './src/server/';

    var tmp = './tmp/';

    var report = './report/';

    var wiredep = require('wiredep');

    var bowerFiles = wiredep({
        devDependencies: true
    })['js'];

    var config = {

        /*
        File Paths
        */

        root: root,

        tmp: tmp,

        // all js to vet
        alljs: [
            './src/**/*.js',
            './*.js'
        ],

        js: [
            clientApp + '**/*module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],

        build: './build/',

        client: client,

        allclient: client + '**/*.*',

        fonts: './bower_components/font-awesome/fonts/**/*.*',

        images: client + 'images/**/*.*',

        less: client + 'styles/styles.less',

        allless: '**/*.less',

        css: tmp + 'styles.css',

        allcss: '**/*.css',

        index: client + 'index.html',

        server: server,

        report: report,

        html: clientApp + '**/*.html',

        htmltemplates: clientApp + '**/*.html',

        /*
        Optimized files
        */

        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },

        /*
        Bower and Node paths
        */

        bower: {
            json: require('./bower.json'),
            directory: ('./bower_components/'),
            ignorePath: '../..'
        },

        packages: [
            './package.json',
            './bower.json'
        ],

        /*
        Node settings
        */

        defaultPort: 7203,

        nodeServer: server + 'app.js',

        browserReloadDelay: 2000,

        /*
        template cache
        */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                strandAlone: false,
                root: 'app/'
            }
        },

        /*
        Karma and testing settings
        */

        specHelpers: [client + 'test-helpers/*.js'],

        serverIntegrationSpecs: [client + 'tests/server-integration/**/*.spec.js']

    };

    config.getDefaultWiredepOptions = getDefaultWiredepOptions();

    config.karma = getKarmaOptions();

    return config;

    function getDefaultWiredepOptions() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    }

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                tmp + config.templateCache.file,
                config.serverIntegrationSpecs
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {
                        type: 'html',
                        subdir: 'report-html'
                    },
                    {
                        type: 'lcov',
                        subdir: 'report-lcov'
                    },
                    {
                        type: 'text-summary'
                    }
                ]
            },
            preprocessors: {}
        };

        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];

        return options;
    }
};
