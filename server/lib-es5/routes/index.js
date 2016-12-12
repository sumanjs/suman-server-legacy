'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by denman on 12/16/15.
 */

var path = require('path');

//config
var config = require('adore')(module, '*suman*', 'server/config/conf');

//core
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {

  res.render('index', {
    childData: (0, _stringify2.default)([]),
    data: ' here is some data in index file !'
  });
});

module.exports = router;