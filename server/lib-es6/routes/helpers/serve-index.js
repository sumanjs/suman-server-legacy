/**
 * Created by denman on 12/14/2015.
 */



let url = require('url');
let fs = require('fs');
let path = require('path');


module.exports = function(req,res){

    let helpers = require('./index');

    let fsPath = req.sumanData.fsPath;

    console.log('fsPath:', fsPath);

    helpers.serveFile(req,res);

};