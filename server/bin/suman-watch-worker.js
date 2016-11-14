'use strict';

process.on('uncaughtException', function (e) {
	const count = process.listenerCount('uncaughtException');
	if (process.env.SUMAN_DEBUG === 'yes' || count < 2) {
		console.log('\n', ' => Suman watcher process uncaughtException:', e.stack || e, '\n');
	}
});

process.on('error', function (e) {
	if (process.env.SUMAN_DEBUG === 'yes' || true) {
		console.log('\n', ' => Suman watcher process error event:', e.stack || e, '\n');
	}
});

process.on('unhandledRejection', function (e) {
	if (process.env.SUMAN_DEBUG === 'yes' || true) {
		console.log('\n', ' => Suman watcher process unhandledRejection event:', e.stack || e, '\n');
	}
});


//core
const assert = require('assert');

//npm


////project ///////

process.env.SUMAN_EXTRANEOUS_EXECUTABLE = 'yes';

////////////////

process.on('message', function (m) {

	var workId = m.workId;
	var fp = m.msg.testPath;
	var transpile = m.msg.transpile;

	if (!transpile) {
		process.argv.push('--no-transpile');
	}

	try {
		assert.equal(workId, m.__poolioWorkerId, ' => Suman watcher error, workId and workerId not equal values.');
	} catch (e) {
		console.error(e.stack || e);
	}

	if (process.env.SUMAN_DEBUG === 'yes') {
		console.log('=> SUMAN_DEBUG message => in poolio worker, workId:', workId, 'workerId:', m.__poolioWorkerId);
		console.log('=> SUMAN_DEBUG message => in poolio worker, workerId:', m.__poolioWorkerId);
		console.log('=> SUMAN_DEBUG message => in poolio worker, message:', m);
		console.log('=> SUMAN_DEBUG message => here are process.argv args:', '\n');
		process.argv.forEach(function (val, index, array) {
			console.log(index + ': ' + val);
		});
	}


	//TODO: process.argv.push('--runner');
	process.argv.push(fp);

	//e.g. => require('/Users/Olegzandr/WebstormProjects/suman/index.js');
	require(process.env.SUMAN_EXECUTABLE_PATH);


});
