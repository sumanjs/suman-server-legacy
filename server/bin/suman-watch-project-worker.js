'use strict';

process.on('uncaughtException', function (e) {
    if (process.env.SUMAN_DEBUG === 'yes' || true) {
        console.error('\n', ' => Suman watcher process uncaughtException:', e.stack || e, '\n');
    }
});

process.on('error', function (e) {
    if (process.env.SUMAN_DEBUG === 'yes' || true) {
        console.error('\n', ' => Suman watcher process error event:', e.stack || e, '\n');
    }
});

process.on('unhandledRejection', function (e) {
    if (process.env.SUMAN_DEBUG === 'yes' || true) {
        console.error('\n', ' => Suman watcher process unhandledRejection event:', e.stack || e, '\n');
    }
});

const cp = require('child_process');
const assert = require('assert');
const path = require('path');

process.on('message', function (m) {

    const workId = m.workId;
    const cmd = m.msg.cmd;
    const projectRoot = m.msg.projectRoot;
    const watcherLogPath = m.msg.watcherLogPath;


    if (process.env.SUMAN_DEBUG === 'yes') {
        console.log('=> SUMAN_DEBUG message => in poolio worker, workId:', workId, 'workerId:', m.__poolioWorkerId);
        console.log('=> SUMAN_DEBUG message => in poolio worker, workerId:', m.__poolioWorkerId);
        console.log('=> SUMAN_DEBUG message => in poolio worker, message:', m);
        console.log('=> SUMAN_DEBUG message => here are process.argv args:', '\n');
        process.argv.forEach(function (val, index, array) {
            console.log(index + ': ' + val);
        });
    }


    const sumanExecutablePath = path.resolve(projectRoot, 'node_modules/.bin/suman');

    const ls = cp.spawn(sumanExecutablePath, ['']);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });


    cp.exec('cd ' + projectRoot + ' && ' + cmd, function (err, stdout, stderr) {
        if (err || String(stdout).match(/error/i) || String(stderr).match(/error/i)) {
            console.error(err.stack || err);
            console.error(stdout);
            console.error(stderr);
            process.send({
                error: err.stack
            });
            setImmediate(function () {
                process.exit(1);
            });
        }
        else {
            process.exit(0);
        }
    });


});
