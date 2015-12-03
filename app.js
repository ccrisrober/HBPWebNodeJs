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


//http://bootswatch.com/darkly/#


//dependencies
var config = require('./config'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    csrf = require('csurf'),



    Set = require("set"), //https://www.npmjs.org/package/set


    multer = require("multer");

//create express app
var app = express();

//keep reference to config
app.config = config;

//setup the web server
app.server = http.createServer(app);

//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  //and... we have a data store
});

//beautiful HTML code
app.locals.pretty=true;

//config data models
require('./models')(app, mongoose);

//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.use(require('method-override')());
app.use(multer({ dest : './upload-folder/' }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({ cookie: { signed: true } }));
helmet(app);

//beautiful HTML code
app.locals.pretty=true;

//response locals
app.use(function(req, res, next) {
  res.cookie('_csrfToken', req.csrfToken());

  res.locals.isLogued = req.isAuthenticated();

  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

//setup passport
require('./passport')(app, passport);

//setup routes
require('./routes')(app, passport);

//custom (friendly) error handler
app.use(require('./views/http/index').http500);

//setup utilities
app.utility = {};
app.utility.os = require("os");
app.utility.fs = require("fs");
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');
app.utility.passRest = "d44c330489a7cff566e1e4981e40f6d93631aaac";

app.utility.Set = Set;
//SHA1 de HbpDesktopC++WebNode
//http://www.hashgenerator.de/


var fs = require('fs');

var data = fs.readFileSync('./datavars.json'), myObj;

var jSchema = fs.readFileSync("./jSchema.json"), myObj2;

try {
  myObj = JSON.parse(data);
  myObj2 = JSON.parse(jSchema);
  console.dir(myObj);
  console.dir(myObj2);
  app.utility.variables = new Set(myObj.vars);
  app.utility.jSchema = jSchema;
}
catch (err) {
  console.log('There has been an error parsing your JSON.')
  console.log(err);
}

console.log(app.utility.variables);

app.set('json spaces', 0);

//listen up
app.server.listen(app.config.port, function(){
  //and... we're live
  console.log("Servidor activo ...");
});
