var dbConfig = require("./config/mysql").cs

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port
  })

var User = sequelize.define('User', {
  username: Sequelize.STRING,
  usercode: {type: Sequelize.STRING, unique: true}
})


var Message = sequelize.define('Message', {
  from: Sequelize.STRING,
  to: Sequelize.STRING,
  message: Sequelize.STRING
})


// sequelize.sync().success(function() {
//   User.create({
//     username: 'sdepold',
//     birthday: new Date(1986, 06, 28)
//   }).success(function(sdepold) {
//     console.log(sdepold.values)
//   })
// })

exports.sequelize = sequelize
exports.User = User
exports.Message = Message
