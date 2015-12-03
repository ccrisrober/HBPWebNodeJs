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
  res.render('calendar/month', {
  	events:[{
    "title": "event one", "date": "2014-01-01", "startTime": "10:00", "endTime": "12:00", "id": 1
  },{
    "title": "event two", "date": "2014-01-08", "startTime": "00:00", "endTime": "24:00", "id": 2
  },{
    "title": "event three", "date": "2014-01-09", "startTime": "18:00", "endTime": "21:00", "id": 3
  }

  ]

  });
};


exports.events = function(req, res) {
  res.json([{"title":"sdfsdf","date":"2014-11-01","startTime":"00:02","endTime":"13:01","id":1},{"title":"ghg","date":"2014-11-01","startTime":"01:00","endTime":"02:00","id":2},{"title":"gfhfgh","date":"2014-11-01","startTime":"14:02","endTime":"02:03","id":3},{"title":"dfgdfg","date":"2014-11-01","startTime":"11:11","endTime":"00:11","id":4},{"title":"adfsdfsdf","date":"2014-11-01","startTime":"02:00","endTime":"03:00","id":5},{"title":"vvvv","date":"2014-11-01","startTime":"23:59","endTime":"12:00","id":6},{"title":"fdfg","date":"2014-11-01","startTime":"","endTime":"","id":7},{"title":"gdfgdfg","date":"2014-11-01","startTime":"03:01","endTime":"04:00","id":8}]);
};
