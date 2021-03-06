var express = require('express');
var router = express.Router();
var User = require("../models").User
var sequelize = require("../models").sequelize

/* GET home page. */
router.get('/', function(req, res) {
  // res.render('index', { title: 'Express' });
  res.render('cs', { title: 'Express' });
});


router.get('/api/messages', function(req, res) {
  var usercode = req.query.usercode
  sequelize.query("SELECT * FROM Messages WHERE `from` = '"+usercode.replace("'", "''")+"' or `to` = '"+usercode.replace("'", "''")+"'").success(function(messages) {
    res.send(messages)
  })
});

router.get('/api/users', function(req, res) {
  sequelize.query("SELECT * FROM Users WHERE usercode <> 'cs'").success(function(users) {
    res.send(users)
  })
});

router.post('/api/users', function(req, res) {
  var user = User.build({
    usercode: req.param("newUserId")
  })
  user.save().success(function() {
    res.send({});
  })
});

router.get('/createcs', function(req, res) {
  var user = User.build({
    usercode: 'cs'
  })
  user.save().success(function() {
    res.send(200);
  })


});


/* GET home page. */
router.get('/client', function(req, res) {
  res.render('client', { title: 'Express' });
});

/* GET home page. */
router.get('/cs', function(req, res) {
  res.render('cs', { title: 'Express' });
});



module.exports = router;
