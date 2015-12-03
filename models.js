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

exports = module.exports = function(app, mongoose) {
  //embeddable docs first
  require('./schema/Note')(app, mongoose);
  require('./schema/Status')(app, mongoose);
  require('./schema/StatusLog')(app, mongoose);
  require('./schema/Category')(app, mongoose);


  // My models
  require("./schema/FaqQuestion")(app, mongoose);
  require("./schema/Experiment")(app, mongoose);
  //require("./schema/TableExperiment")(app, mongoose);
  require("./schema/Contact")(app, mongoose);



  //then regular docs
  require('./schema/User')(app, mongoose);
  require('./schema/Admin')(app, mongoose);
  require('./schema/AdminGroup')(app, mongoose);
  require('./schema/Account')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);
};
