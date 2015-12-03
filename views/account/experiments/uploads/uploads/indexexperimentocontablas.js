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
    workflow.on("checkTypeFile", function()  {


      workflow.emit("checkSchema");
    });

    workflow.on("checkSchema", function(){

      // Aquí validamos fichero con schema :D
      var path = workflow.outcome.path;
      console.log(path);
      console.log(req.user.id);
      var fs = req.app.utility.fs;
      var newPath = __dirname + "/uploads/uploadedFileName";
      fs.readFile(path, function (err, data) {
        if(err) {
          console.log("ERR: " + err);
        }
        console.log(newPath);
        fs.writeFile(newPath, data, function (err) {
          if(err) {
            console.log("ERR: " + err);

          return workflow.emit('exception', err);

          } else {
            var contents = fs.readFileSync(newPath, "utf8");
            var expi = JSON.parse(contents);
            workflow.outcome.expi = expi;
            workflow.emit("uploadJSON");
          }
        });
      });
    });
    workflow.on("uploadJSON", function() {
      var expi = workflow.outcome.expi;
      var tableList = expi.tableList;

      var sigma = [];
      var queries = [];

      tableList.forEach(function(table) {
        queries.push(function(done) {
/*          var matrix = [];

          table.matrix.forEach(function(area) {
            matrix.push({
              data: area.data,
              area: area.area
            });
          });

          var tableFields = {
            headers: table.headers,
            matrix: matrix
          };
          req.app.db.models.TableExperiment.create(tableFields, function(err, tab) {
            if(err) {
              return done(err, null);
            } else {
              console.log("ID: " + tab.id);
              sigma.push(tab);
              done(null, table);
            }
          });
*/
              done(null, table);
        });
      });



      var asyncFinally = function(err, results, next) {
        if(err) {
          return next(err, null);
        }
        console.log("-------------------");
        console.log(sigma);
        console.log("-------------------");
        workflow.outcome.tables = sigma;

        console.log(workflow.outcome.tables);
        var fieldsToSet = {
          name: workflow.outcome.expi.name,
          neuronType: workflow.outcome.expi.nt,
          experiments: workflow.outcome.expi.authors,
          dateDevelopment: workflow.outcome.expi.date,
          createdBy: workflow.outcome.user,
          authors: workflow.outcome.expi.authors,
          tableList: workflow.outcome.expi.tableList,   //sigma,
          uploadedBy: workflow.outcome.user
        };
        console.log("FIELDS:\n" + JSON.stringify(fieldsToSet));
        console.log("Guardamos experimento");
        req.app.db.models.Experiment.create(fieldsToSet, function(err, exp) {
          if(err) {
            console.log("Error: " + err);
          } else {
            console.log("Subido experimento");
          }
        });
        console.log("Experimento guardado");

        workflow.emit("finish");
      };

      require('async').parallel(queries, asyncFinally);
    });

    workflow.on("finish", function() {
      res.render('account/experiments/uploads', {
        code: req.csrfToken(),
        okCode: "File uploaded successfully."
      });
    });

    console.log("Comenzamos");
    workflow.emit("checkTypeFile");
  } else {
      res.render('account/experiments/uploads', {
        code: req.csrfToken(),
        errorCode: "No se ha incluído ningún fichero"
      });
  }
};
