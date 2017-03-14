/**
 * Created by denman on 12/16/15.
 */

let path = require('path');

//config
let config = require('adore')(module, '*suman*', 'server/config/conf');

//core
let express = require('express');
let router = express.Router();


router.get('/',function(req,res){

   res.render('index');

});



module.exports = router;