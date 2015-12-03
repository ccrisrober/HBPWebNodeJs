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

exports.init = function(req, res) {
    //Primero miramos si existe
    var username = "?";
    require('async').series({
        one: function(callback) {
            req.app.db.models.User.findById(req.params.id, function(err, user) {
                console.log(user);
                if (err || user === null) {
                    res.send("No hay usuario D:");
                } else {
                    username = user.username;
                    callback(null, 1);
                }
            });
        },
    }, function(err, results) {
        req.app.db.models.Experiment.find({
            "createdBy": req.params.id
        }).exec(function(err, exps) { // No hace falta populate si tenemos el usuario de la primera consulta :)
            if (err) {
                res.send(err);
            }
            console.log(exps);
            res.render('account/experiments/index', {
                exps: exps,
                title: "Experiment Library From " + username
            });
            //res.send(exps);
        });
    });

};

exports.mylibrary = function(req, res) {
	req.app.db.models.Experiment.find({
		"createdBy": req.user._id
	})
	//.select("name createdAt neuronType dateDevelopment count(tableList)")
	.exec(function(err, exps){    // No hace falta populate si tenemos el usuario de la primera consulta :)
		if(err) {
			res.send(err);
		}
		console.log(exps);
		res.render('account/experiments/author', {
			exps: exps,
			title: "My Experiment Library (" + req.user.username + ")",
			code: req.csrfToken()
		});
	//res.send(exps);
	});
 }
