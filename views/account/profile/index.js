/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 maldicion069
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

var renderSettings = function(req, res, next, oauthMessage) {
  var outcome = {};

  var getAccountData = function(callback) {
    req.app.db.models.Account.findById(req.user.roles.account.id, 'name company').exec(function(err, account) {
      if (err) {
        return callback(err, null);
      }

      outcome.account = account;
      callback(null, 'done');
    });
  };

  var getUserData = function(callback) {
    req.app.db.models.User.findById(req.user.id, 'username email id').exec(function(err, user) {
      if (err) {
        callback(err, null);
      }

      outcome.user = user;
      return callback(null, 'done');
    });
  };

  var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }
    console.log(JSON.stringify(outcome.account));

    req.app.db.models.Experiment.find({
    	"createdBy": outcome.user._id
		})
    .select("_id name description")
		.exec(function(err, exps){	// No hace falta populate si tenemos el usuario de la primera consulta :)
			if(err) {
				res.send(err);
			}
			console.log(exps);
			res.render('account/profile/index', {
				experiments: exps,
				data: {
	        account: outcome.account,
	        user: outcome.user
	      },
			});
		//res.send(exps);
    });
	};

    /*require('async').series({
      one: function(callback){
      	req.app.db.models.User.findById(req.params.id, function(err, user) {
      		console.log(user);
					if(err || user === null) {
						console.log(err);
						console.log(user);
						res.send("No hay usuario D:");
					} else {
						//username = user.username;
						callback(null, 1);
					}
				});
      },
    	},function(err, results) {
	    	req.app.db.models.Experiment.find({
		    	"createdBy": req.params.id
			}).exec(function(err, exps){	// No hace falta populate si tenemos el usuario de la primera consulta :)
				if(err) {
					res.send(err);
				}
				console.log(exps);
				res.render('account/profile/index', {
					experiments: exps,
					data: {
		        account: outcome.account,
		        user: outcome.user
		      },
				});
			//res.send(exps);
		    });
	    });
	  };*/


  require('async').parallel([getAccountData, getUserData], asyncFinally);
};

exports.init = function(req, res, next){
	/*console.log(req.params.username);
	res.render('account/profile/index', {
		"first": "Cristian",
		"last": "Rodríguez Bernal",
		"company": "My home S.A.",
		"username": "maldicion069",
		comments: {

		}
	});*/
	renderSettings(req, res, next, '');
};
