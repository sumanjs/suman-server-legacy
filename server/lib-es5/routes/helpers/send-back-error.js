'use strict';

/**
 * Created by denman on 12/15/15.
 */

let url = require('url');
let fs = require('fs');
let path = require('path');

module.exports = function (req, res) {

    let helpers = require('./index');

    let error = req.sumanData.error || new Error('unknown Suman error');
    res.write(error);
    res.end();
};