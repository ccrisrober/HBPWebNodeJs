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

exports.init = function(req, res){
  res.render('account/experiments/search');
};


exports.search = function(req, res) {
	var name = req.query.name;
	var author = req.query.author;
	var neurons = req.query.neurons;

	console.log(req.query);

	var search = {};

	require('async').series({
		nameSearch: function(call) {
			if(name !== "undefined" && name) {
				search.name = new RegExp(name, "i");
			}
			call(null, 0);
		},
		authorSearch: function(call) {
			if(author !== "undefined" && author) {
				req.app.db.models.User.find({username: new RegExp(author, "i")})
				.select("_id").exec(function (err, user) {
					console.log(user);
					search.createdBy = {};
					search.createdBy.$in = [];
					user.forEach(function(id) {
						search.createdBy.$in.push(id._id);
					});
					call(null, 1);
				});
			} else {
				call(null, 2);
			}
		},
		neuronsSearch: function(call) {
			if(neurons) {
				search.neuronType = {};
				search.neuronType.$in = [];
				if (neurons instanceof Array && neurons.length > 0) {
					neurons.forEach(function(nt) {
						search.neuronType.$in.push(nt);
					});
				} else {
					search.neuronType.$in.push(neurons);
				}
				call(null, 3);
			} else {
				call(null, 4);
			}
		},
		visible: function(call) {
			search.visible = true;
			call(null, 5);
		}
	}, function(err, results) {
		console.log("BÚSQUEDA: " + JSON.stringify(search));
		req.app.db.models.Experiment.find(search)
		//.select("createdBy dateDevelopment name neuronType")
		.populate("createdBy", "username")
		.exec(function(err, exps){
			if(err) {
				res.send(err);
			} else {
				res.render('account/experiments/index', {
					exps: exps
				});
			}
	    });
	});
};
