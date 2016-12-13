'use strict';

/**
 *   search for ZOOM
 */

if (!window && !window.define) {

    console.log("WE ARE RUNNING backend code on the front-end!");
    require('babel-polyfill'); /// this tells Webpack to bundle this dep
    require('underscore'); /// this tells Webpack to bundle this dep
    require('babel-runtime'); /// this tells Webpack to bundle this dep
}

define('underscore', function () {
    return window['underscore'];
});
console.log('underscore is defined');

define('babel-runtime', function () {
    return window['babel-runtime'];
});
console.log('babel-runtime is defined');

define('babel-polyfill', function () {
    return window['babel-polyfill'];
});
console.log('babel-polyfill is defined');