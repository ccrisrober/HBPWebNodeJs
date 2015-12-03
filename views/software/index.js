'use strict';

exports.init = function(req, res){

  var os = req.app.utility.os;

  res.render(
    "software/index", {
    	opsystem: [{
    	so: "Windows",
    	vers: "7",
    	arch: "x86",
    }, {
    	so: "Windows",
    	vers: "7",
    	arch: "x64",
    }, {
    	so: "Linux",
    	vers: "Debian",
    	arch: "x86",
    }, {
    	so: "Linux",
    	vers: "Ubuntu",
    	arch: "x64",
    }, {
    	so: "Mac",
    	arch: "x86",
    }, {
    	so: "Mac",
    	arch: "x64",
    }],
    actual: {
      platform: os.platform(),
      arch: os.arch()
    }

  });
};

exports.SOSelected = function(req, res) {
  console.log(req.params.so);
  res.send(req.params.so);
};

exports.SOArchSelected = function(req, res) {
  console.log(req.params.so);
  console.log(req.params.arch);
  //res.send(req.params.arch);
  var file = __dirname + '/../../upload-folder/leer.txt';
  console.log(file);
  res.download(file, function(err) {
    if(err) {console.log("Error: " + err);}
    else{console.log("file sent");}
  });
  //res.send(file);
};