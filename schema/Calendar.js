'use strict';

exports = module.exports = funcion(app, mongoose) {
	var calendarSchema = new mongoose.Schema({
		date: { type: Date, default: Date.now },
		experiment: { type: mongoose.Shema.Types.ObjectId, ref: "Experiment", required: true }
	});

	calendarSchema.plugin(require("./plugins/pageFind"));
	calendarSchema.index({ date: 1})
	calendarSchema.set("autoIndex", (app.get("env") === "developmen"));
	app.db.model("Calendar", calendarSchema);
};