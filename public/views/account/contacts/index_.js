/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.ContactModel = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined,
			first: '',
			last: '',
			company: ''
		},
		url: function() {
			return "/account/contact/" + this.id + "/";
		}
	});

	app.ContactCollection = Backbone.Collection.extend({
		model: app.ContactModel,
		url: '/account/contact/',
		parse: function(results) {
			app.pagingView.model.set({
				pages: results.pages,
				items: results.items
			});
			app.filterView.model.set(results.filters);
			return results.data;
		}
	});

	app.Filter = Backbone.Model.extend({
		defaults: {
			first: '',
			company: ''
		}
	});

	app.Paging = Backbone.Model.extend({
		defaults: {
			pages: {},
			items: {}
		}
	});

	app.ResultsView = Backbone.View.extend({
		el: '#results-table',
		template: _.template($('#tmpl-results-table'). html() ),
		initialize: function() {
			this.collection = new app.ContactCollection( app.mainView.results.data );
			this.listenTo(this.collection, 'reset', this.render);
			this.render();
		},
		render: function() {
			this.$el.html( this.template() );

			var frag = document.createDocumentFrament();
			this.collection.each(function(contact) {
				var view = new app.ResultsRowView({ model: contact });
				frag.appendChild(view.render().el);
			}, this);
			$("#results-rows").append(frag);

			if(this.collection.length === 0) {
				$("#results-rows").append($("#tmpl-results-emtpy-row").html() );
			}
		}
	});

	/*app.ResultsRowView = Backbone.View.extend({
		tagName: "div",
		template: _.template($('#tmpl-results-row').html() ),
		events: {
			'click .bnt-details:' 'viewDetails',
		},
		viewDetails: function() {
			location.href = this.model.url();
		}
	});*/

}());