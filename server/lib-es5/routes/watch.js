'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by denman on 12/16/15.
 */

//#config
var config = require('adore')(module, '*suman*', 'server/config/conf');

//#core
var fs = require('fs');
var os = require('os');
var path = require('path');
var async = require('async');

//#npm
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var express = require('express');
var router = express.Router();
var _ = require('underscore');

//#project

//react-components

var HTMLParent = require('../react-components/HTMLParent');
var HTMLAdopterParent = require('../react-components/HTMLAdopterParent');
var TestFileSuite = require('../react-components/TestFileSuite');
var Accordion = require('../react-components/AccordionComp');
var AccordionSection = require('../react-components/AccordionSection');

//#helpers
var helpers = require('./helpers');
var watcher = helpers.watcher;

router.post('/done/:runId', function (req, res, next) {

	var data = body.data;

	try {
		var json = (0, _stringify2.default)(data.test);

		if (data.outputPath) {
			fs.appendFileSync(data.outputPath, json += ','); //we write synchronous because we have to ensure data doesn't get malformed in files on disk
			req.sumanData.success = { msg: 'appended data to ' + data.outputPath };
		} else {
			console.error(new Error('no outputPath property on data: ' + data).stack);
		}
		next();
	} catch (err) {
		next(err);
	}
});

router.post('/watch', function (req, res, next) {

	var paths = req.body.paths;

	var w = watcher.watcher;

	if (w) {
		w.add(paths);
	} else {
		watcher.initWatcher(paths);
	}
});

module.exports = router;