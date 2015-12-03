'use strict';

/*var renderAccountIndex = function(req, res, next) {
	var outcome = {};

	var getUserData = function(callback) {
		req.app.db.models.User.findOne({ username: res.locals.user.username }, { timeCreated: 1}, function(err, user) {
			if(err) {
				callback(err, null);
			}

			outcome.timeCreated = user.timeCreated;
			return callback(null, "done");
		});
	};

	var asyncFinally = function(err, results) {
		if(err){
			return next(err);
		}

		res.render("account/index", {
			data: {
				timeCreated: outcome.timeCreated
			}
		});
	};

	require("async").parallel([getUserData, asyncFinally]);
};*/

exports.init = function(req, res, next){
	var time = "2014-10-09T06:07:45.716Z";
	res.render('account/index', {
		nTab: 5,
		timeCreated: time
	});

	//renderAccountIndex(req, res, next, "");
};
