'use strict';

exports.init = function(req, res){
  var isLogin = false;
  if (req.isAuthenticated()) {
    //return next();
    isLogin = true;
  } else {
  	res.set('X-Auth-Required', 'true');
  }
  console.log("IS login: " + isLogin);
  res.render('index', {isLogin: isLogin});
};
