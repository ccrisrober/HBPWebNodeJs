"use strict";

exports.find = function(req, res, next) {
	req.query.question = req.query.question ? req.query.question : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};
	if (req.query.question) {
		filters.question = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
	}

	if (req.query.isResponse) {
		filters.isResponse = req.query.isResponse;
	}

	req.app.db.models.Faq.pagedFind({
		filters: filters,
		keys: "question answer createdOn isResponse",
		limit: req.query.limit,
		page: req.query.page,
		sort: req.query.sort
	}, function(err, results) {
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.header("Cache-Control", "no-cache, no-store, must-revalidate");
			results.filters = req.query;
			res.send(results);
		} else {
			results.filters = req.query;
			res.render("admin/faq/index", { data: { results: JSON.stringify(results) } });
		}
	});
};

exports.read = function(req, res, next) {
	req.app.db.models.Faq.findById(req.params.id).exec(function(err, faq) {
		if(err) {
			return next(err);
		}

		if(req.xhr) {
			res.send(faq);
		} else {
			res.render("/admin/faq/details", { data: { record: escape(JSON.stringify(faq)) } });
		}

	});
};

exports.create = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on("validate", function() {
		if(!req.user.roles.admin.isMemberOf("root")) {
			workflow.outcome.errors.push("You may not update faq");
			return workflow.emit("response");
		}

		if(!req.body.answer) {
			workflow.outcome.errors.push("A answer is required");
			return workflow.emit("respose");
		}

		workflow.emit("duplicateFaqCheck");
	});

	workflow.on("duplicateFaqCheck", function() {
		req.app.db.models.Faq.findOne({ answer: req.body.answer }, function(err, user) {
			if(err) {
				return workflow.emit("exception", err);
			}

			if(user) {
				workflow.outcome.errors.push("That answer is already exist.");
				return workflow.emit("response");
			}

			workflow.emit("createFaq");
		});
	});

	workflow.on("createFaq", function() {
		var fieldsToSet = {
			answer: req.body.answer 
		};

		req.app.db.models.Faq.create(fieldsToSet, function(err, faq) {
			if (err) {
				return workflow.emit("exception", err);
			}

			workflow.outcome.record = faq;
			return workflow.emit("response");
		});
	});

	workflow.emit("validate");
};

exports.update = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on("validate", function() {
		if(!req.user.roles.admin.isMemberOf("root")) {
			workflow.outcome.errors.push("You may not update faq");
			return workflow.emit("response");
		}

		if(!req.body.answer) {
			workflow.outcome.errfor.answer = "required";
			return workflow.emit("response");
		}

		if(!req.body.question) {
			workflow.outcome.errfor.question = "required";
			return workflow.emit("response");
		}

		workflow.emit("responseFaq");
	});

	workflow.on("responseFaq", function() {
		var fieldsToSet = {
			question: req.body.question,
			answer: req.body.answer,
			isResponse: true
		};

		req.app.db.models.Faq.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, faq) {
			if (err) {
				return workflow.emit("exception", err);
			}
			workflow.outcome.faq = faq;
			return workflow.emit("response");
		});

	});

	workflow.emit("validate");
};

exports.delete =function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on("validate", function() {
		if(!req.user.roles.admin.isMemberOf("root")) {
			workflow.outcome.errors.push("You may not update faq");
			return workflow.emit("response");
		}

		workflow.emit("deleteFaq");
	});

	workflow.on("deleteFaq", function(err) {
		req.app.db.models.Faq.findByIdAndRemove(req.params.id, function(err, faq) {
			if (err) {
				return workflow.emit("exception", err);
			}
			workflow.emit("response");
		});
	});
	
	workflow.emit('validate');
};