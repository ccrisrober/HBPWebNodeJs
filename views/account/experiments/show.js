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
		req.app.db.models.Experiment.findById(req.params.id)
			.populate([{
				path: "tableList"
			}, {
				path: "createdBy", select: "id_ username"
			}])
			.exec(function(err, experiment) {
				console.log(experiment);
				console.log(err);
				if(err == null && experiment != null) {
					var toSend = {};
					var visibility = experiment.visible;// || true;
					console.log("ID user" + req.user._id);
					console.log("ID user exp: " + experiment.uploadedBy);
					var isMe = req.user._id == experiment.uploadedBy;
					console.log("V: " + visibility);
					console.log("IsMe:" + isMe);
					if(isMe) {
						toSend.me = true;
					}
					if(!visibility && !isMe) {
						res.render("errors/error", {
							error: "No tienes derecho a visualizar este experimento"
						});
					} else {
						//experiment.description = experiment.description || "------------------------------------------";
						toSend.experiment = experiment;
						toSend.code = req.csrfToken();
						//if(experiment.uploadedBy === req)
						console.log(toSend);
						console.log("VISIBLE: " + experiment.visible);
						res.render('account/experiments/show', toSend);
					}
				} else {
					res.render("errors/error", {
						error: "Experiment not found"
					});
				}
	});
};

exports.download = function(req, res) {

	var workflow = req.app.utility.workflow(req, res);

	var async = require("async");

	workflow.on("getDataFromDatabase", function() {

		req.app.db.models.Experiment.findById(req.params.id)
		.populate("tableList", "matrix headers")
		.populate("createdBy", "username")
		.exec(function(err, experiment) {
			if(err) {
				workflow.emit("exception", "Experiment not found");
			} else {
				console.log(experiment);
				workflow.outcome.exp = {};
				workflow.outcome.exp.name = experiment.name;
				workflow.outcome.exp.authors = [experiment.createdBy.username];
				workflow.outcome.exp.nt = experiment.neuronType;
				workflow.outcome.exp.date = experiment.dateDevelopment;
				workflow.outcome.exp.tableList = [];

				async.each(experiment.tableList, function(table, call) {
					delete table._id;

					var mtx = [];

					async.each(table.matrix, function(matrix, call2) {
						delete matrix._id;
						mtx.push(matrix);
						call2();
					});

					table.matrix = mtx;

					workflow.outcome.exp.tableList.push(table);
					call();
				});

				console.log(workflow.experiment);

				workflow.emit("generateFile");

				//console.log(JSON.stringify(experiment));
			}

		});
	});

	workflow.on("generateFile", function() {
		console.log(JSON.stringify(workflow.exp));

		//workflow.emit('response');
		res.setHeader('Content-disposition', 'attachment; filename=' + require("randomstring").generate() + '.json');
		res.setHeader('Content-type', 'text/plain');
		res.charset = 'UTF-8';


		//res.write(JSON.stringify(obj, null, 4));
		res.write(JSON.stringify(workflow.outcome.exp));
		res.end();
	});

	workflow.emit("getDataFromDatabase");

};


exports.updateVisibility = function(req, res) {
	//console.log(req.body);
	var id = req.body.experiment;

	console.log(id);

	req.app.db.models.Experiment.findById(req.body.experiment)
	.select("visible")
	.exec(function(err, exp) {
		console.log("Exp Find: " + exp);
		console.log("Error Find: " + err);
		console.log("VISIBLE: " + exp.visible);
		console.log("DATE: " + exp.dateDevelopment);
		var updateData = {
		  visible: !exp.visible || false
		};
		console.log(updateData);
		req.app.db.models.Experiment.update({_id: id},
			updateData, function(err, affected) {
			console.log("Affected: " + affected);
			console.log("Error update: " + err);
			if(affected == 1) {
				res.json({
					visible: updateData.visible,
					ok: true
				});
			} else {
				res.json({
					error: true
				});
			}
		});


	});
};

exports.delete = function(req, res) {
	console.log(req.body);
	if(req.body.experiment !== "undefined") {
		req.app.db.models.Experiment.remove({ _id: req.body.experiment }, function(err) {
	    console.log(err);
	    if (!err) {
	      res.json({
					ok: "Borrado con éxito",
					id: req.user._id
				});
	    }
	    else {
	      res.json({
	      	error: err
	      });
	    }
		});
	}

};
