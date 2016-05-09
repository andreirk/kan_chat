var User = require('../models/user').User;
var HttpError = require('error').HttpError;
var ObjectID = require('mongodb').ObjectID;
var checkAuth = require('middleware/checkAuth');

module.exports = function (app) {
  app.get('/', require('./frontpage').get);

  app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);

  app.get('/chat', checkAuth, require('./chat').get);


  // app.get('/users', function (req, res, next) {
  //   User.find({}, function (err, users) {
  //     if(err){
  //       return next(err);
  //     }
  //     res.json(users);
  //   })
  // });
  //
  // app.get('/user/:id', function (req, res, next){
  //   try {
  //     var id = new ObjectID(req.params.id);
  //   } catch (e){
  //     next(404);
  //     return;
  //   }
  //
  //   User.findById(id, function (err, user) {
  //     if(err){
  //       return next(err);
  //     }
  //     if(!user) {
  //       console.log('No user found');
  //       next(new HttpError(404, "User not found"));
  //     }
  //     res.json(user);
  //     console.log('req is ' + req.params.id);
  //   })
  // });


};

// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };