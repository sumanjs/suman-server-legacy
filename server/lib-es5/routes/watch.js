'use strict';

let _stringify = require('babel-runtime/core-js/json/stringify');

let _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by denman on 12/16/15.
 */

//#config
let config = require('adore')(module, '*suman*', 'server/config/conf');

//#core
let fs = require('fs');
let os = require('os');
let path = require('path');
let async = require('async');

//#npm
let React = require('react');
let ReactDOMServer = require('react-dom/server');

let express = require('express');
let router = express.Router();
let _ = require('underscore');

//#project

//react-components

let HTMLParent = require('../react-components/HTMLParent');
let HTMLAdopterParent = require('../react-components/HTMLAdopterParent');
let TestFileSuite = require('../react-components/TestFileSuite');
let Accordion = require('../react-components/AccordionComp');
let AccordionSection = require('../react-components/AccordionSection');

//#helpers
let helpers = require('./helpers');
let watcher = helpers.watcher;

router.post('/done/:runId', function (req, res, next) {

	let data = body.data;

	try {
		let json = (0, _stringify2.default)(data.test);

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

	let paths = req.body.paths;

	let w = watcher.watcher;

	if (w) {
		w.add(paths);
	} else {
		watcher.initWatcher(paths);
	}
});

module.exports = router;