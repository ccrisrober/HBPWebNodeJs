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
  //res.write("joder\n");
  //res.write(req.csrfToken());
  //res.end();
  req.app.db.models.Experiment.find({})
  	.select("tableList name uploadedBy dateDevelopment id name neuronType") // Hay que sacar también nombre y tipo D=
  	.exec(function(err, exps) {
  		if(err) {
  			res.send("Error");
  		} else {
        console.log(exps);
  			res.render('account/experiments/compare/stage1', {
  				code: req.csrfToken(),
  				experiments: exps
  			});
  		}
  	});
};

/**
 * Esta función sirve para que, dado
 *
 */
exports.second = function(req, res) {
  console.log("BODY: " + req.body.fcbklist_value);

  if(req.body.fcbklist_value.length < 2) {
    res.redirect("/account/experiments/compare/");
  } else {
  	//res.send(req.body);

    var orArray = [];

    req.body.fcbklist_value.forEach(function(idExp) {
      orArray.push({_id: idExp});
    });

    console.log(orArray);

    req.app.db.models.Experiment.find({$or: orArray})
      .select("tableList name createdBy dateDevelopment id")
      //.populate("tableList", "id")
      .populate("createdBy", "username")
      .exec(function(err, exps) {
      console.log(err);
      console.log(JSON.stringify(exps));
      res.render("account/experiments/compare/stage2", {
        experiments: exps,
        code: req.csrfToken()
      });
    });
  }
//["54514c6a4650426d2a9bf056","5451853c745acc0a412abf68"]
	// Con esta lista de ids, lo que hacemos es sacar:
		// 1. Cada experimento con:
			// 		name uploadedBy dateDevelopment id
			// y el identificador de cada tabla del experimento.
		// 2. Con esos datos, montamos algo guay con radio button.
};

/**
 *	 En este método recibimos los id's de los experimentos
 *  		y la tabla seleccionada
 *	 Por cada tabla, sacamos las columnas comunes entre ellas e
 *      imprimimos los gráficos de una vez
 */
exports.third = function(req, res) {
  var peticiones = req.body.tab;

  console.log(peticiones);
  var arr = [];

  /*var mapMatch = {
    "a": null,
    "b": null,
    "c": null,
    "Datos2": null
  }*/

  var params = req.app.utility.variables;

  var tabs = [];
  var headersPaths = [];
  var data = {};  // To save the return to view



  var Set = req.app.utility.Set;

  var commons = new Set();

  var async = require('async');
  async.series([

    // First read data from database and save

    function(callback){
      console.log("ejecuto 1");
      async.each(peticiones, function(tabid, call) {
        console.log(tabid);

        req.app.db.models.TableExperiment.findById(tabid).populate("assignedTo", "name neuronType createdBy dateDevelopment description").exec(function(err, tab) {

          var username = "";
          async.series({
            first: function(call2) {
              console.log("Paso 1");
              console.log("Jodeeer, " + tab.assignedTo.createdBy);
              /*console.log(tab);
              async.each(tab, function(tab_, call3) {
                console.log("Buscamos username " + tab_);
                req.app.db.models.User.findById(tab_.createdBy._id).select("username").exec(function(err, user) {
                  console.log("USER : " + user);
                    tab.createdBy = user.username;
                    call3();
                });
              });*/
              req.app.db.models.User.findById(tab.assignedTo.createdBy).select("username").exec(function(err, user) {
                console.log("USER : " + user);
                  tab["username"] = user.username;
                  username = user.username;
                  //tab.username = user.username;
                  call2();
              });
            },
            second: function(call2) {
              console.log("Paso 2");
              // TODO: Controlar "err"
              var tab_ = {};
              tab_.assignedTo = {
                _id: tab.assignedTo._id,
                username: username,
                createdBy: tab.assignedTo.createdBy,
                name: tab.assignedTo.name,
                neuronType: tab.assignedTo.neuronType,
                dateDevelopment: tab.assignedTo.dateDevelopment,
                description: tab.assignedTo.description
              };
              tab_.id = tab._id;
              tab_.matrix = tab.matrix;
              tab_.headers = tab.headers;



/*
assignedTo:
   { _id: 545bde715e4a5d4a4089ad21,
     createdBy: 545bde535e4a5d4a4089ad1f,
     name: 'Mi physiological',
     neuronType: 'PHYSIOLOGICAL' },
  _id: 545bde715e4a5d4a4089ad52,
  __v: 0,
  matrix: */

              console.log("SECOND : " + tab_);
              // Añadimos la tabla al sistema
              //console.log("Añado " + tab);
              tabs.push(tab_);

              // Recorro las cabeceras y genero un mapa con k(header) y v(position)
              var mapMatch = {};
              console.log(tab.headers);
              tab.headers.forEach(function(header, pos) {
                if(params.contains(header)) {
                  mapMatch[header] = pos;
                }
              });
              //console.log("Añado " + JSON.stringify(mapMatch));
              headersPaths.push(mapMatch);  // Guardamos el mapeo
              call2();
            }
          }, function(err, results) {
            call();
          });
        });

      }, function(err) {
        callback();
      });
    },

    // Filter columns that I use to compare table's experiment
    function(callback) {

      console.log("Tengo : " + tabs.length);
      console.log("Tengo : " + headersPaths.length);

      // Guardamos todos los valores de "params" en "data"
      data.headers = {};
      params.get().forEach(function(value) {
        data.headers[value] = [];//undefined;
      });

      console.log(JSON.stringify(data));

      // Creamos el attr "exps" dentro de "data"
      data.exps = [];

      // Ahora por cada experimento, cargamos los datos correspondientes
      headersPaths.forEach(function(headerPath, index) {

        console.log("--------- Empezamos a recorrer con header " + headerPath + " ---------");

        var posHeader = 0;
        Object.keys(headerPath).forEach(function(key) {

          console.log(key + " <=> " + headerPath[key]);

          //tabs.forEach(function(tab, ii) {

            tabs[index].matrix.forEach(function(matrix, area) {

              //console.log("Header: " + key + "\tNº Tab: " + ii + "\tArea: " + area);

              data.headers[key][area] = data.headers[key][area] || [0];  // Si existe se queda igual, si no, se añade array

              data.headers[key][area].push(matrix.data[posHeader]);

            });

          //});



          /*var infoData = [];


          tabs[index].matrix.forEach(function(matrix, area) {

            infoData.push(matrix.data[posHeader]);

          });

          //console.log(infoData);
          console.log("Inserta del index " + posHeader);

          data.headers[key].push(infoData);*/

          posHeader++;
        });

        // Volcamos la información del experimento asociado a cada tabla
        data.exps.push(tabs[index].assignedTo);

      });

      console.log("----------------------");
      console.log("----------------------");

      //console.log(data);

      console.log("----------------------");
      console.log("----------------------");

      /*async.each(arr, function(tab, call) {
        tab.headers.forEach(function(header, position) {
          //if(mapMatch[header] != undefined) {
          if(header in tab.mapMatch) {
            tab.mapMatch[header] = position;
          }
        });

        // Remove all columns that not contains in mapMatch
        //tab.mapMatch.forEach(function(position) {

        //});

        call();
      });*/

      callback();

    }
  ],
  // finish callback
  function(err, results){
    console.log("FIN: " + arr.length);
    console.log(params.intersect(commons));
    //res.send(data);
    /*var ret = {
      data: data
    };
    res.send(ret);*/
    console.log("----------------------");
    console.log("----------------------");
    console.log("----------------------");
    console.log("----------------------");
    console.log(JSON.stringify(data));

    res.render("account/experiments/compare/stage3", {
      data: data,
      code: req.csrfToken(),
      id: 0
    });
  });
};

// TODO: No funciona bien T.T







/*exports.downloadHTML = function(req, res) {
  phantom = require('phantom')

  phantom.create(function(ph){
    ph.createPage(function(page) {
      page.open("http://www.google.com", function(status) {
        page.render('google.pdf', function(){

          console.log('Page Rendered');
          ph.exit();

        });
      });
    });
  });
};*/
