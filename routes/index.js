var express = require('express');
var router = express.Router();
var User = require("../models").User
var sequelize = require("../models").sequelize

/* GET home page. */
router.get('/_jmd/', function(req, res) {
  res.render('index', { title: 'Express' });
});


router.get('/_jmd/api/messages', function(req, res) {
  var usercode = req.query.usercode
  sequelize.query("SELECT * FROM Messages WHERE `from` = '"+usercode.replace("'", "''")+"' or `to` = '"+usercode.replace("'", "''")+"'").success(function(messages) {
    res.send(messages)
  })
});

router.get('/_jmd/api/users', function(req, res) {
  sequelize.query("SELECT * FROM Users WHERE usercode <> 'cs'").success(function(users) {
    res.send(users)
  })
});

router.post('/_jmd/api/users', function(req, res) {
  var user = User.build({
    usercode: req.param("newUserId")
  })
  user.save().success(function() {
    res.send({});
  })
});

router.get('/_jmd/createcs', function(req, res) {
  var user = User.build({
    usercode: 'cs'
  })
  user.save().success(function() {
    res.send(200);
  })


});


/* GET home page. */
router.get('/_jmd/client', function(req, res) {
  res.render('client', { title: 'Express' });
});

/* GET home page. */
router.get('/_jmd/cs', function(req, res) {
  res.render('cs', { title: 'Express' });
});



module.exports = router;
