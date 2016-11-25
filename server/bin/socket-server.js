/*

 README: the Suman server allows socketio client connections - when a watch message is sent to the server,
 we will begin watching the files requested to be watched - upon a file change (the developer saves changes to a test file)
 we most likely will transpile/run that file, by sending a message to the Poolio process pool with the filepath
 of the test file that changed. When the file changes, we first truncate the test-stdout.log file, then all other writing
 operations to that file are append operations.

 */


//core
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const util = require('util');
const async = require('async');
const assert = require('assert');
const tty = require('tty');

//npm
const socketio = require('socket.io');
const chokidar = require('chokidar');
const _ = require('lodash');
const Pool = require('poolio');

//project
const runTranspile = require('suman-utils/run-transpile');

//////////////////////////////////////////////////

var watching = false;

/////////////////////////////////////////////////

const sumanExecutablePath = path.resolve(global.projectRoot, 'node_modules/.bin/suman');
const watcherOutputLogPath = path.resolve(global.sumanHelperDirRoot + '/logs/watcher-output.log');
const projectWatcherOutputLogPath = path.resolve(global.sumanHelperDirRoot + '/logs/project-watcher-output.log');
var strm1;
// var strm1 = fs.createWriteStream(projectWatcherOutputLogPath);
// var strm2 = fs.createWriteStream(projectWatcherOutputLogPath);

if (process.env.SUMAN_DEBUG === 'yes') {
  console.log('sumanMatchesAll:', global.sumanMatchesAll);
  console.log('sumanMatchesAny:', global.sumanMatchesAny);
  console.log('sumanMatchesNone:', global.sumanMatchesNone);
  console.log('global.sumanHelperDirRoot:', global.sumanHelperDirRoot);
  console.log('watcherOutputLogPath:', watcherOutputLogPath);
}

fs.writeFileSync(watcherOutputLogPath,
  //'w' flag truncates the file, the only time the file is truncated
  '\n\n => Suman server will write to this log file when any of your test files change.\n\n', {
    flags: 'w',
    flag: 'w'
  });

fs.writeFileSync(projectWatcherOutputLogPath,
  //'w' flag truncates the file, the only time the file is truncated
  '\n\n => Suman server will write to this log when any of your project files change.\n\n', {
    flags: 'w',
    flag: 'w'
  });

function getStream () {
  return fs.createWriteStream(watcherOutputLogPath, {
    flags: 'a',
    flag: 'a'
  });
}

//TODO: if stdout and stderr share the same writable stream maybe their output will be in the right order?
const workerPath = require.resolve('./suman-watch-worker.js');

var pool;

function createPool () {
  pool = pool || new Pool({
      size: 3,
      oneTimeOnly: true,
      addWorkerOnExit: true,
      silent: true,
      filePath: workerPath,
      getSharedWritableStream: getStream,
      // stdout: getStream,
      // stderr: getStream
      // env: _.extend(process.env, {
      // 	SUMAN_WATCH: 'yes'
      // })
    });
}

///////////////////////////////////////////////////

const watcherOpts = {
  ignore: [ '**/*.txt', '**/*.log' ],
  ignored: [ '**/*.txt', '**/*.log' ],
  ignoreInitial: true
  // ignored: /(\.txt|\.log)$/
};

function initiateTranspileAction (p, opts, executeTest) {

  const items = _.flattenDeep([ p ]);

  const transpileThese = items.filter(function (p) {
    return pathHash[ p ].transpile;
  });

  const doNotTranspileThese = items.filter(function (p) {
    return !pathHash[ p ].transpile;
  });

  process.nextTick(function () {

    if (doNotTranspileThese.length > 0) { //explicit for your pleasure

      logMessageToWatcherLog('\n\n => the following files apparently do not need transpilation and will ' +
        'be run directly => \n' + doNotTranspileThese);

      runTestWithSuman(doNotTranspileThese);
    }

  });

  logMessageToWatcherLog('\n\n => the following files will first be transpiled/copied => \n' + transpileThese);

  runTranspile(transpileThese, (opts || {}), function (err, results) {
    if (err) {
      console.log(' => transpile error:', util.inspect(err.stack || err));
      logMessageToWatcherLog('\n\n => Suman server => file transpilation error => \n' + util.inspect(err.stack || err));
    }
    else {
      console.log('\n\n', ' => transpile results:', util.inspect(results), '\n');
      logMessageToWatcherLog('\n\n => file(s) transpiled successfully =>', util.inspect(results));

      if (executeTest) {

        //TODO: not all of these should be executed
        runTestWithSuman(results.map(item => {
          console.log(' => Suman server item to be run after transpilation:', util.inspect(item));
          const hashItem = pathHash[ item.originalPath ];
          console.log(' => Suman server going to add testTarget property to the following item:', util.inspect(hashItem));
          hashItem.targetPath = item.targetPath;
          return item.originalPath;
        }));
      }
    }
  });

}

function doesMatchAll (filename) {
  return global.sumanMatchesAll.every(function (regex) {
    return String(filename).match(regex);
  });
}

function doesMatchAny (filename) {
  return !global.sumanMatchesAny.every(function (regex) {
    return !String(filename).match(regex);
  });
}

function doesMatchNone (filename) {
  return global.sumanMatchesNone.every(function (regex) {
    return !String(filename).match(regex);
  });
}

function logMessageToWatcherLog (msg) {
  console.log(msg);
  fs.writeFileSync(watcherOutputLogPath,
    '\n' + msg, {
      flags: 'a',
      flag: 'a'
    });
}

function runTestWithSuman ($tests) {

  var logExtraMsg = false;

  console.log('$tests =>', util.inspect($tests));

  const flattenedTests = _.flattenDeep([ $tests ]);

  if (flattenedTests.length < 1) {
    console.log(new Error(' => Warning empty set of tests pass to runTestWithSuman().').stack, ' => tests => ', flattenedTests, '\n');
    return;
  }

  const filteredTests = flattenedTests.filter(function (originalTestPath) {

    console.log('originalTestPath:', originalTestPath);
    console.log('pathHash:', util.inspect(pathHash));

    const valFromHash = pathHash[ originalTestPath ];

    if (!valFromHash) {
      console.log(' => Suman server warning => no valFromHash for given originalTestPath.');
      return false;
    }

    if (!valFromHash.execute) {
      return false;
    }
    const _matchesInput = doesMatchAny(originalTestPath);
    const _doesNotMatch = doesMatchNone(originalTestPath);
    const _doesMatchAll = doesMatchAll(originalTestPath);

    if (process.env.SUMAN_DEBUG === 'yes') {
      console.log(' => item:', originalTestPath);
      console.log(' => matchesAny:', _matchesInput);
      console.log(' => matchesNone:', _doesNotMatch);
      console.log(' => matchesAll:', _doesMatchAll);
    }

    const condition = _matchesInput && _doesNotMatch && _doesMatchAll;

    if (!condition) {
      logExtraMsg = true;
      //TODO: if it doesn't match regex it shouldn't get transpiled either?
      const msg = ' => Suman server message => the following file changed =>\n' + originalTestPath
        + '\n and may have been transpiled,\n' +
        '\t but it did not match the regular expressions necessary to run the test =>\n' +
        '\t => the filepath must match one of' + util.inspect(global.sumanMatchesAny) +
        '\n and must not match any of => ' + util.inspect(global.sumanMatchesNone) + '\n matches positive input = ' + _matchesInput +
        '\n does not match any negative input ' + _doesNotMatch;
      logMessageToWatcherLog(msg);
      console.log(msg);
    }
    return condition;

  });

  if (logExtraMsg) {
    const msg1 = ' => Regexes that effect the execution of a test:\n' +
      'positive matches: ' + global.sumanMatchesAny + '\n' +
      'negative matches: ' + global.sumanMatchesNone;
    logMessageToWatcherLog(msg1);
  }

  if (filteredTests.length < 1) {
    const msg2 = ' => Suman watcher => No test files matched regexes, nothing to run. We are done here.';
    console.log(msg2);
    logMessageToWatcherLog(msg2);
    return;
  }

  // const cmd = sumanExec + ' ' + tests.join(' ');
  //
  // console.log('\n\n => Suman watcher => test will now be run with command:\n', cmd);

  logMessageToWatcherLog('\n => Suman watcher => test will now execute.\n\n');

  if (process.env.SUMAN_DEBUG === 'yes') {
    logMessageToWatcherLog('\n => pool size => ' + JSON.stringify(pool.getCurrentSize()) + '\n');
  }

  //note: we want to kill all suman workers that are
  //currently running tests and writing to the watcher-output.log file
  pool.killAllActiveWorkers();

  console.log('All active poolio workers killed, pool stats:', pool.getCurrentSize());

  const promises = filteredTests.map(function (t) {
    const item = pathHash[ t ];
    const p = item.transpile ? item.targetPath : item.testPath;
    return pool.any({
      transpile: item.transpile,
      testPath: p
    });
  });

  Promise.all(promises).then(function (val) {
    console.log('Pool response:', val);
  }, function (e) {
    console.error(e.stack || e);
  });

}

const pathHash = {};
var watcher;

//TODO: look out for for memory leaks here
module.exports = function (server) {

  const io = socketio(server);

  io.sockets.on('connection', function (socket) {

    console.log('\n', 'Client connected.', '\n');

    socket.on('disconnect', function () {
      console.log('\nClient disconnected.\n');
    });

    socket.on('error', function (err) {
      console.log(' => Socket.io error => ' + err.stack || err);
    });

    var flip = true;

    socket.on('stop-tty', function (message) {

      try {
        message = JSON.parse(message);
      }
      catch (err) {

      }

      flip = false;
      console.log('stop-tty-received !! => message => ', message);
      socket.emit('stop-tty-received');
    });

    socket.on('watch-project', function (data) {

      try {
        data = JSON.parse(data);
      }
      catch (err) {

      }


      const script = data.script;
      var exclude = data.exclude || [];
      var include = data.include || [];
      var fd_stdout = data.fd_stdout;
      var fd_stderr = data.fd_stderr;

      console.log('fd_stdout', fd_stdout, 'fd_stderr', fd_stderr);

      const execStringArray = String(script).split(/\s+/);
      const execStringArrayCopy = ['" $',execStringArray.join(' '),'"'].join(' ');
      const executable = execStringArray.shift();

      assert(Array.isArray(exclude) && Array.isArray(include), 'exclude/include are not arrays.');

      process.nextTick(function () {
        socket.emit('watch-project-request-received', 'received');
      });

      exclude = exclude.concat([ '**/node_modules/**', '**/*.txt', '**/*.log', '**.git/**', '**.idea/**' ]);

      //TODO: throttle this so that if there are 50+ file changes only 2 requests make it...!!

      console.log('watch-project request received!! => data => ', data);

      // used to be include[0]

      const projectWatcher = chokidar.watch(include, {
        ignored: exclude,
        ignore: exclude,
        ignoreInitial: true
      });

      projectWatcher.once('ready', () => {
        console.log('\n\n', ' => Suman server => Suman watch process => Initial scan complete. Ready for changes');
        const watched = projectWatcher.getWatched();
        console.log(' => Suman server => watched paths:', watched);
      });

      // var fd_stdout, fd_stderr;
      var $fd, stdioStrm;
      var to, child;

      projectWatcher.on('change', function (p) {

          p = String(p).replace('___jb_tmp___', '').replace('___jb_old___', ''); //for Webstorm support

          console.log(`File ${p} has been changed`);

          clearTimeout(to);

          //throttle the code, any requests that come within a half second of each other, only last one gets through
          to = setTimeout(function () {
            run();
          }, 500);

          var fn = null;

          function run () {

            console.log(' => Stdout/stderr streams open/ready, now spawning child process...');

            if (child) {
              try {
                child.kill();
              }
              catch (err) {
                console.error(err.stack || err);
              }
            }

            if (stdioStrm) {
              try {
                stdioStrm.end();
              }
              catch (err) {
                console.error(err.stack || err);
              }
            }

            if ($fd !== undefined) {
              try {
                fs.closeSync($fd)
              }
              catch (err) {
                console.error(err.stack || err);
              }
            }

            // $fd = fd_stdout = fd_stderr = fs.openSync('/dev/ttys001', 'a');

            try {
              if (flip) {
                $fd = fs.openSync(fd_stdout, 'a');
              }
            }
            catch (err) {
              flip = false; // user probably closed original terminal window, stop trying to write to any terminal/tty
              console.error(err.stack || err);
              $fd = null;
            }

            fn = function () {

              child = cp.spawn(executable, execStringArray, {
                env: Object.assign({}, process.env, {
                  SUMAN_DEBUG: 'ys'
                }),
                // stdio: [ 'ignore', 1, 2 ]
              });

              child.stdout.setEncoding('utf8');
              child.stderr.setEncoding('utf8');

              console.log('$fd', $fd);

              const stdioStrm = fs.createWriteStream(null, { fd: $fd });


              const firstMsg = '\n\n => Suman watcher => file changed: "' + p + '"\n';
              const secondMsg = '\n => Now running the following command => ' + execStringArrayCopy + '\n\n';

              stdioStrm.write(firstMsg);
              stdioStrm.write(secondMsg);

              if (tty.isatty($fd)) {
                console.error('fd with value => ', $fd, '*is* a tty!');
                child.stdout.pipe(stdioStrm);
              }
              else {
                console.error('fd with value => ', $fd, 'is not a tty');
              }

              if (tty.isatty($fd)) {
                console.error('fd with value => ', $fd, '*is* a tty!');
                child.stderr.pipe(stdioStrm);
              }
              else {
                console.error('fd with value => ', $fd, 'is not a tty');
              }




              fs.writeFileSync(projectWatcherOutputLogPath,
                //'w' flag truncates the file, the only time the file is truncated
                '\n\n => Suman watcher => file changed: "' + p + '"\n\n', {
                  flags: 'w',
                  flag: 'w'
                });

              strm1 = fs.createWriteStream(projectWatcherOutputLogPath);
              // strm2 = fs.createWriteStream(projectWatcherOutputLogPath);
              strm1.write(firstMsg);
              strm1.write(secondMsg);
              child.stdout.pipe(strm1);
              child.stderr.pipe(strm1);



            };

            if (!child || (child && child.sumanClosed)) {
              fn();
              fn = null;
            }

            child.on('close', function () {
              child.sumanClosed = true;
              console.log(' => Suman server => project-watcher child process has fired "close" event.');
              try {
                stdioStrm.end(' => To stop the watcher process, use "$ suman --stop-watching"');
                stdioStrm.end();
              }
              catch (err) {
                console.error(err.stack || err);
              }
              finally {
                if (fn) {
                  fn();
                }
              }
            });

            // })

          }

        }
      );

    });

    //TODO: need to add hash, that shows whether files need to be transpiled or not

    socket.on('stop-watching', function () {

      console.log(' => Suman server => "stop-watching" request received via socket.io.');

      if (watcher) {
        // Stop watching.
        watcher.close();
        watcher = null;

        // const watched = watcher.getWatched();
        // console.log('\n\n => Watched paths before "unwatch":', watched);
        // // watcher.unwatch('**/*.js');
        //
        // Object.keys(watched).forEach(function (key) {
        //     const array = watched[key];
        //     array.forEach(function (p) {
        //         const temp = String(path.resolve(key + '/' + p));
        //         console.log(' => The following file path is being unwatched =>', temp);
        //         watcher.unwatch(temp);
        //     });
        //
        // });
        //
        // console.log('\n\n => Watched paths after "unwatch":', watcher.getWatched());
      }
      else {
        console.log(' => Suman server * warning * => no watch to call "stop watching" on.');
      }

    });

    socket.on('watch', function ($msg) {

      console.log(' => Suman server => "watch" request received via socket.io.');
      socket.emit('watch-request-received', 'received');

      createPool();

      const msg = JSON.parse($msg);

      const paths = msg.paths.map(function (p) {
        return String(p).replace('___jb_tmp___', '').replace('___jb_old___', ''); //JetBrains support
      });

      const transpile = msg.transpile || false;

      function setWatched (watched) {
        (function (w) {
          Object.keys(w).forEach(function (key) {
            const array = w[ key ];
            array.forEach(function (p) {
              const temp = String(path.resolve(key + '/' + p)).replace('___jb_tmp___', '').replace('___jb_old___', '');
              console.log(' => The following file path is being saved as { transpile:', transpile, '} =>', temp);
              pathHash[ temp ] = {
                transpile: transpile,
                testPath: temp,
                execute: true
              }
            });

          });
        })(watched);
      }

      console.log('\n', ' => Suman server event => socket.io watch event has been received by server:\n', msg, '\n');

      if (watcher) {
        console.log('\n\n => Watcher exists => Watched paths before:', watcher.getWatched());
        paths.forEach(function (p) {
          console.log(' => Suman server => watcher is adding path =>', p);
          watcher.add(p);
        });

        function updatePathHash () {
          //TODO: this needs an upgrade => setWatched() call is needed
          if (watcher) { //TODO: what if watcher is closed?
            const watched = watcher.getWatched();
            console.log('\n\n', ' => Suman server => watched paths:', watched, '\n\n');
            setWatched(watched);
          }
          console.log('\n\n', ' => Suman server => pathHash:', util.inspect(pathHash), '\n\n');
        }

        setTimeout(updatePathHash, 700);
        setTimeout(updatePathHash, 1200);
        setTimeout(updatePathHash, 2000);
        setTimeout(updatePathHash, 4000);

      }
      else {
        console.log('\n', ' => Suman server => chokidar watcher initialized.', '\n');
        watcher = chokidar.watch(paths, watcherOpts);

        watcher.on('add', p => {
          p = String(p).replace('___jb_tmp___', '').replace('___jb_old___', ''); //JetBrains support
          console.log(`File ${p} has been added`);
          initiateTranspileAction(p);
        });

        watcher.on('change', p => {

          console.log(`File ${p} has been changed`);

          p = String(p).replace('___jb_tmp___', '').replace('___jb_old___', ''); //for Webstorm support

          console.log(util.inspect(pathHash[ String(p) ]));

          if (!pathHash[ p ]) {
            console.error(' => Suman server warning => the following file path was not already stored in the pathHash:', p);
          }

          fs.writeFileSync(watcherOutputLogPath,  //'w' flag truncates the file, the only time the file is truncated
            '\n\n => Suman watcher => file changed:\n' + p, {
              flags: 'w',
              flag: 'w'
            });

          if (pathHash[ p ] && pathHash[ p ].transpile) {
            console.log(` =>  transpiling file => ${p}`);
            initiateTranspileAction(p, null, true);
          }
          else {
            console.log(` =>  now running file without transpile => ${p}`);
            runTestWithSuman(p);
          }
        });

        watcher.on('unlink', p => {
          console.log(`File ${p} has been removed`);
          initiateTranspileAction([], { all: true });
        });

        watcher.on('addDir', p => {
          console.log(`Directory ${p} has been added.`);
          initiateTranspileAction(p);
        });

        watcher.on('unlinkDir', p => {
          console.log(`Directory ${p} has been removed`);
          initiateTranspileAction([], { all: true });
        });

        watcher.on('error', error => {
          console.log(`chokidar watcher error: ${error}`)
        });

        watcher.on('ready', () => {
          console.log('\n\n', ' => Suman server => Suman watch process => Initial scan complete. Ready for changes');
          const watched = watcher.getWatched();
          console.log('\n\n', ' => Suman server => watched paths:', watched, '\n\n');
          setWatched(watched);
        });

        watcher.on('raw', (event, p, details) => {
          if ([ '.log', '.txt' ].indexOf(path.extname(p)) < 0) {
            if (process.env.SUMAN_DEBUG === 'yes') {
              console.log('\n\nRaw event info:', event, p, details, '\n\n');
            }
          }
        });
      }

    });

    socket.on('TEST_DATA', function (data) {

      try {
        var json = JSON.stringify(data.test);

        if (data.outputPath) {

          //TODO: this functionality needs to mirror writing to disk in suman test runner etc

          console.log('TEST_DATA received - data.outputPath:', data.outputPath);

          process.nextTick(function () {
            socket.emit('TEST_DATA_RECEIVED', { msg: 'appended data to ' + data.outputPath });
          });

        }
        else {
          console.error(new Error('no output p for test data: ' + JSON.stringify(data)).stack);
        }
      }
      catch (err) {
        console.error(err.stack);
        socket.emit('TEST_DATA_RECEIVED', { error: err.stack });
      }

    });

  });

};