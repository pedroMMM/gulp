module.exports = function () {

    var client = './src/client/';

    var clientApp = client + 'app/';

    var tmp = './.tmp/';

    var config = {

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

        client: client,

        less: [client + 'styles/styles.less'],

        css: [
            tmp + 'styles.css'
        ],

        index: client + 'index.html',

        bower: {
            json: require('./bower.json'),
            directory: ('./bower_components/'),
            ignorePath: '../..'
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
