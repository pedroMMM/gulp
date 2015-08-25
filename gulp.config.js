module.exports = function () {

    var client = './src/client/';

    var clientApp = client + 'app/';

    var server = './src/server/';

    var tmp = './tmp/';

    var config = {

        /*
        File Paths
        */

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

        html: clientApp + '**/*.html',

        htmltemplates: clientApp + '**/*.html',

        /*
        Bower and Node paths
        */

        bower: {
            json: require('./bower.json'),
            directory: ('./bower_components/'),
            ignorePath: '../..'
        },

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
        }

    };

    config.getDefaultWiredepOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    return config;
};
