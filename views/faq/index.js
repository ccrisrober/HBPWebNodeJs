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
	req.app.db.models.Faq.find({}, function(err, faqs) {
		if(err) {
			res.send("Error");
		} else {
			res.render("faq", {
				data: faqs,
				code: req.csrfToken()
			});
		}
	});
	/*res.render("faq", {
		data: [{
			question: "Ey",
			response: "<p>Do you see any Teletubbies in here? Do you see a slender plastic tag clipped to my shirt with my name printed on it? Do you see a little Asian child with a blank expression on his face sitting outside on a mechanical helicopter that shakes when you put quarters in it? No? Well, that's what you see at a toy store. And you must think you're in a toy store, because you're here shopping for an infant named Jeb.</p><p>Do you see any Teletubbies in here? Do you see a slender plastic tag clipped to my shirt with my name printed on it? Do you see a little Asian child with a blank expression on his face sitting outside on a mechanical helicopter that shakes when you put quarters in it? No? Well, that's what you see at a toy store. And you must think you're in a toy store, because you're here shopping for an infant named Jeb.</p>",
		}, {
			question: "jooo",
			response: "<p>Chanante ipsum dolor sit amet, gaticos saepe ea gañán saepe. Agazapao enim ut. Ut ex nisi quis cacahué nisi ut et. Ea ea minim one more time es de traca. Ut ut veniam minim. Aliqua ut aliqua ut eveniet nostrud nisi ayy qué gustico minim dolore adipisicing.</p><p>Ea nisi zanguango ut ad horcate saepe. Adipisicing ea aliqua tempor exercitation ut cartoniano to sueltecico bufonesco dolore ea ad viejuno. Gatete nui enim veniam monguer Guaper. Exercitation veniam tunante atiendee, nisi cabeza de viejo cuerpo de joven aliqua et. Bizcoché enim zagal ullamco sed saepe nostrud minim et nisi coconut, sed estoy fatal de lo mío exercitation. Ut dolore, ex incididunt. Exercitation magna nostrud traeros tol jamón pepinoninoni incididunt veniam magna tontiploster veniam eiusmod ad.</p>",
		}, {
			question: "jooo xDDD",
			response: "<p>Y, viéndole don Quijote de aquella manera, con muestras de tanta tristeza, le dijo: Sábete, Sancho, que no es un hombre más que otro si no hace más que otro.</p><p>Todas estas borrascas que nos suceden son señales de que presto ha de serenar el tiempo y han de sucedernos bien las cosas; porque no es posible que el mal ni el bien sean durables, y de aquí se sigue que, habiendo durado mucho el mal, el bien está ya cerca.</p><p>Así que, no debes congojarte por las desgracias que a mí me suceden, pues a ti no t</p>",
		}],
		code: req.csrfToken()
	});*/
};

exports.save = function (req, res) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on("validate", function() {
		if (!req.body.question) {
			workflow.outcome.errfor.question = "required";
		}

		if (!req.body.answer) {
			workflow.outcome.errfor.answer = "required";
		}
		workflow.emit("duplicateFaqCheck");
	});

	workflow.on("duplicateFaqCheck", function() {
		req.app.db.models.Faq.findOne({ question: req.body.question}, function(err, faq) {
			if (err) {
				return workflow.emit("exception", err);
			}

			if (faq) {
				workflow.outcome.errfor.question = "question already taken";
				return workflow.emit("response");
			}

			workflow.emit("createFaq");
		});
	});

	workflow.on("createFaq", function() {
		var fieldsToSet = {
			question: req.body.question,
			answer: req.body.answer
		};

		req.app.db.models.Faq.create(fieldsToSet, function(err, user) {
			if(err) {
				return workflow.emit("exception", err);
			}







		});
	});

	workflow.emit("validate");
};


/*exports.byID = function(req, res) {
	console.log(req.params.id);
	res.send(req.params.id);
};*/

exports.createNew = function(req, res) {
	console.log(req.body.question);
	req.app.db.models.Faq.create({question: req.body.question}, function(err, question) {
		console.log(err);
		if(err) {
			res.json( { error: "Se ha producido un error." } );
		} else {
			res.json( { ok: "Se ha guardado correctamente." } );
		}
	});
	//res.json("Trolololo");
};
