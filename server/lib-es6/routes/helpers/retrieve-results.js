/**
 * Created by denman on 12/14/2015.
 */


let url = require('url');
let fs = require('fs');
let path = require('path');
let helpers = require('./index');
let du = require('du');
let config = global.sumanConfig;


// module.exports = function (req, res) {
//
//     let helpers = require('./index');
//
//     let urlTemp = String(req.parsedRequestUrl.pathname);
//
//     console.log('urlTemp:', urlTemp);
//
//     let index = urlTemp.indexOf('/results/');
//
//     console.log('index:', index);
//
//     let resultsPath = urlTemp.substr(index + String('/results/').length);
//
//     //let resultsPath = urlTemp.match('/results/');
//     //
//     console.log('results path:', resultsPath);
//
//     let mainDir = path.resolve(appRootPath + '/results/');  //TODO: appRootPath removed
//
//     du(mainDir, function (err, size) { //get size of results dir
//         console.log('The size of /results/ is:', size, 'bytes');
//
//         size = size / 1000;
//
//         if (config.resultsCapSize && config.resultsCapSize <= size) {
//
//             let deleteThisDir = helpers.getPathOfOldestSubdir(mainDir);
//             if (deleteThisDir) {
//                 fs.unlinkSync(deleteThisDir);
//             }
//         }
//
//         let fsPath;
//         if (resultsPath === 'latest') {
//
//             let serveThisDir = helpers.getPathOfMostRecentSubdir(mainDir);
//             if (serveThisDir) {
//                 fsPath = req.sumanData.fsPath = path.resolve(appRootPath + '/' + 'results' + '/' + serveThisDir + '/' + 'temp.html');
//                 if (fsPath) {
//                     helpers.serveFile(req, res);
//                 }
//                 else {
//                     req.sumanData.error = new Error('no result set');
//                     helpers.sendBackError(req, res);
//                 }
//             }
//             else {
//                 helpers.sendBackError(req, res);
//             }
//         }
//         else if (typeof Number(resultsPath) === 'number' && !isNaN(Number(resultsPath))) {
//
//             fsPath = req.sumanData.fsPath = path.resolve(appRootPath + '/' + 'results' + '/' + resultsPath + '/' + 'temp.html');
//             if (fsPath) {
//                 helpers.serveFile(req, res);
//             }
//             else {
//                 req.sumanData.error = new Error('no result set');
//                 helpers.sendBackError(req, res);
//             }
//
//         }
//         else {
//
//             helpers.serveFile(req, res);
//         }
//
//
//     });
//
//
// };