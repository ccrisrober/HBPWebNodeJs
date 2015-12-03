'use strict';

// quitar el uploadedBu o cambiar de nombre lo de createdby xD

exports = module.exports = function(app, mongoose) {

	var neurType = ["MORPHOLOGICAL", "GENOMICAL", "PHYSIOLOGICAL"];

	var experimentSchema = new mongoose.Schema({
		name: { type: String, required: true },
		authors: [String],
		neuronType: { type: String, enum: neurType, required: true },
		createdAt: { type: Date, default: Date.now, required: true },
		dateDevelopment: { type: Date, required: true },
		uploadedBy: { type:String, required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		tableList: [ { type: mongoose.Schema.Types.ObjectId, ref: "TableExperiment", required: true } ],
		description: { type: String, required: false },
		visible: {type: Boolean, default: true }
	});

	var tableSchema = new mongoose.Schema({
		headers: [ { type: String }], // debo comprobar que meto los valores de las columnas mínimas
		matrix: [ {
			data: [String],
			area: { type: Number, min: 1, max: 47 }
		} ],
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Experiment", required: true }
	});

	app.db.model("TableExperiment", tableSchema);

	experimentSchema.plugin(require('./plugins/pagedFind'));
	experimentSchema.index({ name: 1 });
	experimentSchema.index({ authors: 1 });
	experimentSchema.set("autoIndex", (app.get("env") === "development"));
	app.db.model("Experiment", experimentSchema);

};