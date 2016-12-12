//core
const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const async = require('async');
const _ = require('underscore');
const request = require('request');
const ijson = require('siamese');
const cp = require('child_process');

//gulp plugins
const babel = require('gulp-babel');
// const react = require('gulp-react');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const nodemon = require('gulp-nodemon');
const requirejs = require('gulp-requirejs');

//suman utils
const defaultConfig = require('./suman.default.conf.js');

//args & env
const argv = JSON.parse(JSON.stringify(process.argv));
const $node_env = process.env.NODE_ENV;

//you should be able to run your tests with gulp, instead of npm run blah

gulp.task('clean-temp', function () {
    return del(['dest']);
});

gulp.task('transpile-lib', [/*'clean-temp'*/], function () {
    return gulp.src(['server/lib-es6/**/*.js'])
        .pipe(babel({
            presets: ['react']
        }))
        .pipe(gulp.dest('server/lib-es5'));
});


// gulp.task('transpile-lib', [/*'clean-temp'*/], function () {
//     return gulp.src(['server/lib-es6/**/*.js'])
//         .pipe(react({
//             harmony: true
//         }))
//         .pipe(gulp.dest('server/lib-es5'));
// });


gulp.task('transpile-rc', ['transpile-lib'], function () {
    return gulp.src(['server/lib-es5/react-components/**/*.js'])
        .pipe(babel({
            plugins: ['transform-es2015-modules-amd']
        }))
        .pipe(gulp.dest('server/public/js/react-components'));
});

gulp.task('convert', ['transpile-lib'], function (cb) {   //convert commonjs to amd

    cp.exec('node_modules/.bin/r.js -convert server/lib-es5/react-components server/public/js/react-components', function (err, stdout, stderr) {
        if (err) {
            cb(err)
        }
        else if (err = (String(stdout).match(/error/i) || String(stderr).match(/error/i))) {
            console.error(stdout + stderr);
            cb(err);
        }
        else {
            cb(null);
        }

    });

});


gulp.task('webpack', ['transpile-lib'], function (cb) {

    const n = cp.spawn('webpack');
    n.on('close', cb);
    n.stderr.setEncoding('utf8');
    n.stderr.on('error', console.error.bind(console));
});

gulp.task('nodemon', ['webpack'], function () {

    nodemon({

        script: 'server/bin/www',
        ext: 'js',
        ignore: ['server/lib-es5/**/*', 'server/public/*', '*.git/*', '*.idea/*', 'gulpfile.js'],
        args: [], //TODO: add these from command line
        nodeArgs: ['--harmony'],
        env: Object.assign({}, process.env, {
            NODE_ENV: $node_env || 'development',
            SUMAN_CONFIG: JSON.stringify(defaultConfig),
            SUMAN_SERVER_OPTS: '',
            SUMAN_PROJECT_ROOT: __dirname
        })

    }).on('restart', ['webpack']);

});

gulp.task('default', function () {

    nodemon({

        script: 'server/bin/www',
        ext: 'js',
        ignore: ['server/lib-es5/**/*', 'server/public/*', '*.git/*', '*.idea/*', 'gulpfile.js'],
        args: [], //TODO: add these from command line
        nodeArgs: ['--harmony'],
        env: Object.assign({}, process.env, {
            NODE_ENV: $node_env || 'development',
            SUMAN_CONFIG: JSON.stringify(defaultConfig),
            SUMAN_SERVER_OPTS: '',
            SUMAN_PROJECT_ROOT: __dirname
        })

    }).on('restart', []);

});

