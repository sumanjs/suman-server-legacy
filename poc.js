/**
 * Created by t_millal on 10/6/16.
 */



const path = require('path');
const cp = require('child_process');


const sumanExecutablePath = path.resolve(__dirname, 'node_modules/.bin/suman');

const ls = cp.spawn(sumanExecutablePath, [''], {
    env: Object.assign({}, process.env, {
        SUMAN_DEBUG: 'yes'
    })
});

ls.stdout.setEncoding('utf8');
ls.stderr.setEncoding('utf8');

ls.stdout.on('data', function (d) {
    console.log(d);
});

ls.stderr.on('data', function (d) {
    console.log(d);
});


ls.on('close', function () {
    console.log('child process has "close" event, exiting...');
    process.exit(0);
});