/* global app:true */

(function() {
	'use strict';

	app = app || {};

	/*app.Router = Backbone.Router.extend({
		initialize: function(opts) {
			this.main = opts.main;
			this.navView = new app.NavView();
		},
		routes: {
			'': 'index',
			'user/:id': 'showUser'
		},
		index: function() {
			this.main.html(this.navView.render().el);
		},
		showUser: function() {
			var self = this,
				user,
				experiments;

			id = parseInt(id, 10);
			function render() {
				var userView = new userView({
					model: user.toJSON(),
					collection: expermients
				});
				self.main.html(self.navView.render().el);
				self.main.append(userView.render().el);
			}

			if(id === USER.id) {
				user = new UserModel(USER);
				experimients = this.userExperiments;
				render();
			} else {
				user = new UserModel({id: id});
				experimients = new Experiments({url: "/contactos/exps"});
				user.fetch().then(function() {
					experimients.fetch().then(render);
				});
			}
		}
	});

	app.ExperimentView = Backbone.View.extend({
		tagName: "ul",
		template: _.template($("#tmpl-experimentView").html()),
		render: function() {
			this.collection.forEach(this.addExperiment, this);
			return this;
		},
		addExperiment: function(experiment) {
			this.$el.append(this.template(experiment.toJSON()));
		}
	})

	app.NavView = Backbone.View.extend({
		template: _.template($("#tmpl-navView").html()),
		render: function() {
			this.el.innerHTML = this.template(USER);
			return this;
		}
	});

	app.UserModel = Backbone.Model.extend({
		url: function() {
			return "/contactos/exps"		//return '/user-' + this.get('id') + '.json';
		}
	})


	$(document).ready(function() {
		app.router = new app.Router({
			main: $("#main")
		});
		Backbone.history.start();	//{ pushState: true });
	});*/

}());