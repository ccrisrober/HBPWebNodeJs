'use strict';

exports = module.exports = function(req, res) {
  var workflow = new (require('events').EventEmitter)();

  workflow.outcome = {
    success: false,
    errors: [],
    errfor: {}
  };

  workflow.hasErrors = function() {
    return Object.keys(workflow.outcome.errfor).length !== 0 || workflow.outcome.errors.length !== 0;
  };

  workflow.on('exception', function(err, route) {
    workflow.outcome.errors.push('Exception: '+ err);
    workflow.outcome.route = route;
    return workflow.emit('response');
  });

  workflow.on('response', function() {
    workflow.outcome.success = !workflow.hasErrors();
    res.send(workflow.outcome);
    /*console.log(workflow.outcome);
    if(workflow.outcome.route) {
      res.render(workflow.outcome.route, workflow.outcome);
    } else {
      res.send(workflow.outcome);
    }*/
  });

  return workflow;
};
