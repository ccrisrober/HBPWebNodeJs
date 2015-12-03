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
  console.log("USER: " + req.user);
	req.app.db.models.Experiment.find()
  .where("visible", "true")
  .sort({dateUpload: 'desc'})
  .populate('createdBy').exec(function(err, exps){
		console.log(exps[0]);
      if(!err){
      res.render('account/experiments/index', {
		  exps: exps,
		  title: "Experiment Library",
      id: req.user.id
		});
      } else {
      console.log('ERROR: ' + err);
      res.send('ERROR: ' + err);
      }
    });
};

/* Creo que para sacar dónde trabaja el usuario que ha subido el experimento, con el actual populate, debería recorrer
 * todos los experimentos y consultar los datos de casa usuario.
 * Para optimizar, podría guardar en una mapa [id_user] = lugar_trabajo*/
