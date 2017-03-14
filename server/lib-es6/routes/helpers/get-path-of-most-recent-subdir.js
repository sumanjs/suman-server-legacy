/**
 * Created by denman on 12/15/15.
 */



let url = require('url');
let fs = require('fs');
let path = require('path');
let _ = require('underscore');

module.exports = function (dir) {

    //TODO: these functions should be async...

    try {

        console.log('dir:', dir);

        let filtered = fs.readdirSync(dir).filter(function (subdir) {
            return (!fs.statSync(path.resolve(dir + '/' + subdir)).isFile() && typeof Number(subdir) === 'number' && !isNaN(Number(subdir)));
        });

        return _.sortBy(filtered, function (subdir) {  //note: return the first element of array after sorting
            return -1 * parseInt(subdir);
        })[0];
    }
    catch (err) {
        return null;
    }


};