/* global app:true */

(function() {
  'use strict';

	app = app || {};

	app.CalendarModel = Backbone.Collection.extend({
		model: app.EventModel,
	    url: "/events",
	    comparator: function (a, b) {
	        return a.start().isAfter(b.start());
	    },
	    onDate: function (date) {
	        return new app.CalendarModel(this.filter(function (model) {
	            return model.start().isSame(date, 'day');
	        }));
	    }
	});

	app.EventModel = Backbone.Model.extend({
		start: function() {
			return moment(this.get("date") + " " + this.get("startTime"));
		},
		hours: function() {
			var hours = [],
				start = this.start(),
				end = this.end();
			while(start.isBefore(end)) {
				hours.push(start.format("h:mm A"));
				start.add(1, "hour");
			}
			return hours;
		},
		end: function() {
			var endTime = moment(this.get("date") + " " + this.get("endTime"));
			if(this.get("endTime") === "00:00") {
				endTime.add(1, "day");
			}
			return endTime;
		},
		validate: function (attrs) {
			if (attrs.collection) {
				var takenHours = _.flatten(attrs.collection.invoke('hours'));
				var hours = this.hours().map(function (x) {
					return takenHours.indexOf(x);
				}).filter(function (x) {
					return x > -1;
				}).length;
				this.unset('collection');
				if (hours > 0) {
					return "You already have an event at that time.";
				}
			}
		}

	});

	app.MonthModel = Backbone.Model.extend({
		defaults: {
			year: moment().year(),
			month: moment().month()
		},
		initialize: function(/*opts*/) {
			var m = this.moment();
			this.set("name", m.format("MMMM"));
			this.set("days", m.daysInMonth());
			this.set('weeks', Math.ceil((this.get('days') + m.day()) / 7));
		},
		moment: function() {
			return moment([this.get("year"), this.get("month")]);
		},
		weekDates: function(num) {
			var days = 7,
				dates = [],
				start = this.moment().day();

			if(num === 0) {
				days -= start;
				start = 0;
			}

			var date = num * 7 + 1 - start,
					end = date + days;

			for(; date < end; date++) {
				if(date > this.get("days")) {
					continue;
				}
				dates.push(date);
			}

			return dates;

		}
	});

	app.Router = Backbone.Router.extend({
		initialize: function(opts) {
			this.main = opts.main;
			this.calendar = opts.calendar;
			//app.Router.navigate = this.navigate.bind(this);
		},
		routes: {
			"": "month",
			":year/:month": "month",
			":year/:month/:day" : "day"
		},
		month: function(year, month) {
			var c = this.clean(year, month);

			this.main.html(new app.MonthView({
				collection: this.calendar,
				model: new app.MonthModel({ year: c[0], month: c[1] })
			}).render().el);
		},
		clean: function(year, month, day) {
			console.log(moment().format());
			var now = moment();
			year = parseInt(year, 10)				||	now.year();

			month = month? (parseInt(month, 10) -1) % 12 : now.month();

			//var a = (parseInt(month, 10) - 1) % 12
			//month = (parseInt(month, 10) - 1) % 12	||	now.month();
			day = parseInt(day, 10)					||	now.day();
			return [year, month, day];
		},
		day: function(year, month, day) {
			var date = moment(this.clean(year, month, day));

			this.main.html(new app.DayView({
				date: date,
				collection: this.calendar
			}).render().el);
		}
	});


	app.DayView = Backbone.View.extend({
		template: _.template($("#tmpl-viewday").html()),
		initialize: function(opts) {
			this.date = opts.date;
        	this.listenTo(this.collection, 'hover', this.showDetails);
		},
		events: {
			'click .back': 'backToMonth'
		},
		render: function() {
			this.el.innerHTML = this.template({
				date: this.date.format("MMMM D, YYYY")
			});
			this.$("div").append(new app.DayTableView({
				date: this.date,
				collection: this.collection
			}).render().el);

			var div = this.$("div").append("<div>");

			this.details = new app.ViewDetails();
			div.append(this.details.el);

			div.append(new app.CreateEventView({
				date: this.date.format('YYYY-MM-DD'),
				collection: this.collection
			}).render().el);

			return this;
		},
		backToMonth: function() {
			Backbone.history.navigate(this.date.format("/YYYY/MM"), {trigger: true});
		},
	    showDetails: function (model) {
	        this.details.changeModel(model);
	    }
	});


	app.MonthView = Backbone.View.extend({
		template: _.template( $('#tmpl-month').html() ),
		events: {
			'click .prev': 'prev',
			'click .next': 'next'
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			var weeks = this.model.get("weeks");
			for(var i = 0; i < weeks; i++) {
				this.$("tbody").append(new app.WeekRow({
					week: i,
					model: this.model,
					collection: this.collection
				}).render().el);
			}
			return this;
		},
		prev: function() {
			var route = this.model.moment().subtract(1, 'month').format("YYYY/MM");
			Backbone.history.navigate(route, { trigger: true });
		},
		next: function() {
			var route = this.model.moment().add(1, 'month').format("YYYY/MM");
			Backbone.history.navigate(route, { trigger: true });
		},
	});


	app.DayTableView = Backbone.View.extend({
		tagName: "table",
		className: "day",
		template: _.template($("#tmpl-dayTable").html()),
		events: {
			'mouseover tr.highlight td.event': 'hover',
			'mouseout tr.highlight td.event': 'hover'
		},
		initialize: function(opts) {
			this.date = opts.date;
			this.listenTo(this.collection, 'add', this.addEvent);
			this.listenTo(this.collection, 'destroy', this.destroyEvent);
			this.hours = {};
		},
		render: function() {
			this.el.innerHTML = this.template();

			for(var i = 0; i < 24; i++) {
				var time = moment(i, "H").format("h:mm A");
				this.hours[time] = new app.ViewHour({
					time: time
				});
				this.$("tbody").append(this.hours[time].render().el);
			}
			this.collection.onDate(this.date).forEach(this.addEvent, this);
			return this;
		},
		addEvent: function(evt) {
			evt.hours().forEach(function(hour) {
				this.hours[hour].displayEvent(evt);
			}, this);
		},
		destroyEvent: function(evt) {
			evt.hours().forEach(function(hour) {
				this.hours[hour].removeEvent();
			}, this);
		},
		hover: function(e) {
			var id = parseInt(e.currentTarget.getAttribute("data-id"), 10),
				evt = this.collection.get(id);

			evt.hours().forEach(function(hour) {
				this.hours[hour].hover();
			}, this);

			this.collection.trigger("hover", evt);
		}
	});

	app.ViewHour = Backbone.View.extend({
		tagName: "tr",
		template: _.template($("#tmpl-hour").html()),
		initialize: function(opts) {
			this.time = opts.time;
		},
		render: function() {
			this.el.innerHTML = this.template({time: this.time});
			return this;
		},
		displayEvent: function(model) {
			this.$el.addClass("highlight");
			this.$(".event").attr("data-id", model.get("id"));
			this.$(".event").text(model.get("title"));
		},
		removeEvent: function() {
			this.$el.removeClass("highlight");
			this.$(".event").removeAttr("data-id");
			this.$(".event").text("");
		},
		hover: function() {
			this.$el.toggleClass("hover");
		}
	});



	app.WeekRow = Backbone.View.extend({
		tagName: "tr",
		initialize: function(opts) {
			if(opts) {
				this.week = opts.week;
			}
		},
		render: function() {
			var month = this.model;

			if(this.week === 0) {
				var firstDay = month.moment().day();
				for(var i = 0; i < firstDay; i++) {
					this.$el.append("<td>");
				}
			}

			month.weekDates(this.week).forEach(function(date) {
				date = month.moment().date(date);
				this.$el.append(new app.DayCellView({
					model: date,
					collection: this.collection.onDate(date)
				}).render().el);
			}, this);

			return this;

		}
	});


	app.DayCellView = Backbone.View.extend({
		tagName: "td",
		template: _.template( $('#tmpl-day').html() ),
		events: {
			'click': 'switchToDayView'
		},
		render: function() {
			this.$el.html(this.template({
				num: this.model.date(),
				titles: this.collection.pluck("title")
			}));
			return this;
		},
		switchToDayView: function() {
			Backbone.history.navigate(this.model.format("YYYY/MM/DD"), {
				trigger: true
			});
		}
	});

	app.ViewDetails = Backbone.View.extend({
		template: _.template($("#tmpl-details").html()),
		events: {
			"click button": "delete"
		},
		initialize: function() {
			this.data = {
				title: "Hover over an event to see details",
				start: ""
			};
			this.render();
		},
		render: function() {
			this.el.innerHTML = this.template(this.data);
			return this;
		},
		changeModel: function(model) {
			this.model = model;
			var s = this.model.start(),
				e = this.model.end();
			this.data = {
				title: model.get("title"),
				start : s.format("h:mm A"),
				end: e.format("h:mm A"),
				duration: e.diff(s, "hour") + " hours"
			};
			return this.render();
		},
		delete: function() {
			this.model.destroy();
		}
	});


	app.CreateEventView = Backbone.View.extend({
		tagName: "form",
		template: _.template($("#tmpl-createEvent").html()),
		initialize: function(opts) {
			this.date = opts.date;
		},
		events: {
			"click button": "createEvent"
		},
		render: function() {
			this.el.innerHTML = this.template();
			return this;
		},
		createEvent: function (evt) {
			evt.preventDefault();
			var model = new app.EventModel({
				collection: this.collection.onDate(this.date),
				title: this.$("#eventTitle").val(),
				date: this.date,
				startTime: this.$("#eventStartTime").val(),
				endTime: this.$("#eventEndTime").val()
			});
			if (model.isValid()) {
				this.collection.create(model, { wait: true });
				this.el.reset();
				this.$(".error").text('');
			} else {
				this.$(".error").text(model.validationError);
			}
			return false;
		}

	});


	$(document).ready(function() {
		app.router = new app.Router({
			main: $("#main"),
			calendar: new app.CalendarModel([{"title":"sdfsdf","date":"2014-11-01","startTime":"00:02","endTime":"13:01","id":1},{"title":"ghg","date":"2014-11-01","startTime":"01:00","endTime":"02:00","id":2},{"title":"gfhfgh","date":"2014-11-01","startTime":"14:02","endTime":"02:03","id":3},{"title":"dfgdfg","date":"2014-11-01","startTime":"11:11","endTime":"00:11","id":4},{"title":"adfsdfsdf","date":"2014-11-01","startTime":"02:00","endTime":"03:00","id":5},{"title":"vvvv","date":"2014-11-01","startTime":"23:59","endTime":"12:00","id":6},{"title":"fdfg","date":"2014-11-01","startTime":"","endTime":"","id":7},{"title":"gdfgdfg","date":"2014-11-01","startTime":"03:01","endTime":"04:00","id":8},{"title":"dfsdf","date":"2014-12-01","startTime":"01:00","endTime":"01:01","id":9},{"title":"XD","date":"2014-12-01","startTime":"08:00","endTime":"09:00","id":10}])
		});

		//var lol = new app.CalendarModel().fetch();
		//console.log(lol);

		Backbone.history.start();	//{ pushState: true });
	});
}());



// NO carga los eventos del server T.T''