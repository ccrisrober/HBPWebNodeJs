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
  res.render('account/experiments/uploads', {code: req.csrfToken()});
};

/*function getExtension(filename) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}*/

exports.upload = function(req, res) {

  console.log(req.body);

  if ( typeof req.files.myFile !== 'undefined' && req.files.myFile )  {
    var workflow = req.app.utility.workflow(req, res);

    workflow.outcome.path = req.files.myFile.path;

    workflow.outcome.user = req.user._id;
    if(req.body.description && req.body.description.length > 75) {
      req.body.description = req.body.description.substr(0, 75);
    }
    workflow.outcome.description = req.body.description;
    workflow.on("checkTypeFile", function()  {

      var path = require('path');
      var type = path.extname(workflow.outcome.path);

      if(type === ".json") {
        workflow.emit("checkSchema");
      } else {
        workflow.emit("errorSuccess", "Fichero no válido");
      }

    });

    workflow.on("checkSchema", function(){

      var path = workflow.outcome.path;
      console.log(path);
      console.log(req.user.id);
      var fs = req.app.utility.fs;
      var newPath = __dirname + "/uploads/uploadedFileName";
      fs.readFile(path, function (err, data) {
        if(err) {
          console.log("ERR: " + err);
          res.render('account/experiments/uploads', {
            code: req.csrfToken(),
            errorCode:  err
          });
        } else {
          console.log(newPath);
          fs.writeFile(newPath, data, function (err) {
            if(err) {
              console.log("ERR: " + err);
              res.render('account/experiments/uploads', {
                code: req.csrfToken(),
                errorCode:  err
              });

              //return workflow.emit('exception', err);

            } else {
              var contents = fs.readFileSync(newPath, "utf8");
              var expi;

              try {
                // Compruebo que el fichero se puede leer sin problemas
                console.log("Cargando: ");
                expi = JSON.parse(contents);


                // Aquí validamos fichero con schema :D
                var Validator = require('jsonschema').Validator;
                var v = new Validator();

                //var schema = {"type":"object","$schema": "http://json-schema.org/draft-03/schema","id": "http://jsonschema.net","required":false,"properties":{ "authors": { "type":"array", "id": "http://jsonschema.net/authors", "required":true, "items": { "type":"string", "id": "http://jsonschema.net/authors/0", "required":true } }, "date": { "type":"string", "id": "http://jsonschema.net/date", "required":true }, "name": { "type":"string", "id": "http://jsonschema.net/name", "required":true }, "nt": { "type":"string", "id": "http://jsonschema.net/nt", "required":true }, "tableList": { "type":"array", "id": "http://jsonschema.net/tableList", "required":true, "items": { "type":"object", "id": "http://jsonschema.net/tableList/0", "required":true, "properties":{ "headers": { "type":"array", "minitems": "1", "id": "http://jsonschema.net/tableList/0/headers", "required":true, "uniqueItems": true, "items": { "type":"string", "id": "http://jsonschema.net/tableList/0/headers/0", "required":true } }, "matrix": { "type":"array", "id": "http://jsonschema.net/tableList/0/matrix", "required":true, "items": { "type":"object", "id": "http://jsonschema.net/tableList/0/matrix/0", "required":true, "properties":{ "area": { "type":"number", "minimum":1, "maximum":47, "id": "http://jsonschema.net/tableList/0/matrix/0/area", "required":true }, "data": { "type":"array", "id": "http://jsonschema.net/tableList/0/matrix/0/data", "required":true, "items": { "type":"string", "id": "http://jsonschema.net/tableList/0/matrix/0/data/0", "required":false } } } } } } } } }};

                var errors = v.validate(expi, req.app.utility.jSchema).errors;

                console.log(errors);

                if(errors.length > 0) {
                  workflow.emit("errorSuccess", "Error al validar el fichero"); //errors);
                } else {
                  console.log("Leo");
                  console.log(expi);
                  workflow.outcome.expi = expi;
                  workflow.emit("uploadJSON");
                }



              } catch (e) {
                console.log("ERR: " + e);
                /*res.render('account/experiments/uploads', {
                  code: req.csrfToken(),
                  errorCode: e
                });*/
                workflow.emit("errorSuccess", e);
              }
            }
          });
        }
      });
    });
    workflow.on("uploadJSON", function() {
      var expi = workflow.outcome.expi;
      var tableList = expi.tableList;

      require('async').series({
        one: function(callback){
          var fieldsToSet = {
            name: workflow.outcome.expi.name,
            neuronType: workflow.outcome.expi.nt,
            experiments: workflow.outcome.expi.authors,
            dateDevelopment: workflow.outcome.expi.date,
            createdBy: workflow.outcome.user,
            authors: workflow.outcome.expi.authors,
            tableList: [], /*workflow.outcome.expi.tableList,*/  //sigma,
            uploadedBy: workflow.outcome.user,
            description: workflow.outcome.description
          };
          console.log("FIELDS:\n" + JSON.stringify(fieldsToSet));
          console.log("Guardamos experimento");
          req.app.db.models.Experiment.create(fieldsToSet, function(err, exp) {
            if(err) {
              console.log("ERR: " + err);
              res.render('account/experiments/uploads', {
                code: req.csrfToken(),
                errorCode:  err
              });
            } else {
              console.log("Subido experimento");
              workflow.outcome.experimentSaved = exp;
              workflow.outcome.experimentIdRollBack = exp._id;
              console.log(exp);
              callback(null, 1);
            }
          });
        },
        two: function(callback){

          //var sigma = [];
          workflow.outcome.sigma = [];
          console.log("Empiezo dos");
          var id = workflow.outcome.experimentSaved._id;
          require("async").each(tableList, function(table, callback2) {


            var set = new req.app.utility.Set(table.headers); // Controlo los repetidos

            // Primero miramos si tenemos ḿínimo un elemento
            var error_ = (set.size() !== table.headers.length) ? "Headers repetidos" : null;

            // Miramos si tenemos mínimo una variable fija.
            if(!error_) {
              var set2 = set.intersect(req.app.utility.variables);
              error_ = set2.empty() ? "Mínimo una variable fija" : null;
            } else {
              var set2 = set.intersect(req.app.utility.variables);
              error_ += set2.empty() ? " Mínimo una variable fija" : "";
            }

            console.log(error_);

            if(set.size() !== table.headers.length) { // TODO: Mirar si hay al menos una cabecera buena
            //if( error_.length > 0 ) {
              workflow.emit("errorSuccess", "Headers repetidos");
            } else {
              console.log(table.headers);
              var matrix = [];

              table.matrix.forEach(function(area) {
                matrix.push({
                  data: area.data,
                  area: area.area
                });
              });

              var tableFields = {
                headers: table.headers,
                matrix: matrix,
                assignedTo: id
              };

              req.app.db.models.TableExperiment.create(tableFields, function(err, tab) {
                if(!err) {
                  console.log("ID: " + tab.id);
                  workflow.outcome.sigma.push(tab.id);
                  callback2();
                } else {
                  console.log("ERR: " + err);
                  res.render('account/experiments/uploads', {
                    code: req.csrfToken(),
                    errorCode:  err
                  });
                }
              });
            }
          }, function(err) {
            console.log("finish 2");
            callback();
          });
        }
    },
    function(err, results) {
      console.log("finish");
      require("async").each(workflow.outcome.sigma, function(table_id, call) {
        workflow.outcome.experimentSaved.tableList.push(table_id);
        call();
      }, function(err) {
        console.log(workflow.outcome.experimentSaved.tableList);
        workflow.outcome.experimentSaved.save(function(err) {
          if (err) {
            res.render('account/experiments/uploads', {
              code: req.csrfToken(),
              errorCode: "Error al subir el fichero."
            });
          }
          else {
            /*req.app.db.models.Calendar.create({experiment: workflow.outcome.experimentSaved._id}, function(err, tab) {
              if(!err) {
                workflow.emit("finish");
              }
            });*/
            workflow.emit("finish");
          }
        });
      });



      //res.send("FINISH");
        // results is now equal to: {one: 1, two: 2}
    });


    });

    workflow.on("finish", function() {
      res.render('account/experiments/uploads', {
        code: req.csrfToken(),
        okCode: "File uploaded successfully."
      });
    });

    workflow.on("errorSuccess", function(errs) {
      console.log("ERROR SUCCESS: " + errs);
      // Borramos el experimento de la base de datos si existe, para no dejar inconsistente la BBDD
      if(workflow.outcome.experimentIdRollBack) {
        console.log("ERROR SUCCESS ROLL BACK: " + errs);
        req.app.db.models.Experiment.remove( {"_id": workflow.outcome.experimentIdRollBack},
          function(err_,numberRemoved){
            console.log(numberRemoved);

            // TODO: Imprimir "err" en un log
            console.log("EXCP REMOVE:" + errs);

            var errCode = errs; // || "Upload error";

            if(errCode.toString().indexOf("SyntaxError") >= 0) {
              errCode = "Fichero incorrecto.";
            }

            res.render('account/experiments/uploads', {
              code: req.csrfToken(),
              errorCode: errCode //"Se ha producido un error."
            });

        });
      } else {
        // TODO: Imprimir "err" en un log
        console.log("EXCP ELSE:" + errs);
        console.log("ERROR SUCCESS ELSE: " + errs);

        var errCode = errs;

        if(errCode.toString().indexOf("SyntaxError") >= 0) {
          errCode = "Fichero incorrecto.";
        }

        res.render('account/experiments/uploads', {
          code: req.csrfToken(),
          errorCode: errCode //"Se ha producido un error."
        });
      }
    });

    console.log("Comenzamos");
    workflow.emit("checkTypeFile");
  } else {
    res.render('account/experiments/uploads', {
      code: req.csrfToken(),
      errorCode: "No se ha incluído ningún fichero."
    });
  }
};
