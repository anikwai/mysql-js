/*
 Copyright (c) 2013, Oracle and/or its affiliates. All rights
 reserved.
 
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; version 2 of
 the License.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 02110-1301  USA
 */
"use strict";

var udebug = unified_debug.getLogger("multipartkeys/QueryScanTest.js");
var QueryTest = require('../lib/QueryTest.js');

var q1 = { 
  name: 'q1',
  queryType: 3,  /* table scan */
  expected: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  predicate: function(q) {
    return q;
  }
};

var q2 = {
  name: 'q2',
  queryType: 2,  /* index scan */
  expected: [16, 17, 18, 19, 20], 
  predicate: function(q) {
    return q.k3.isNull();
  }
};

var q3 = { 
  name: 'q3',
  queryType: 2, 
  expected: [8,9,10,11,12,13,14,15,16,17,18,19,20],
  p1: 1,
  predicate: function(q) {
    return q.k1.gt(q.param("p1"));
  }
};

var q4 = { 
  name: 'q4',
  queryType: 2,
  expected: [11,12,13,14,15],
  p1: 1010,
  predicate: function(q) {
    return q.k3.gt(q.param("p1"));
  }
};

var q5 = {
  name: 'q5',
  queryType: 2,
  expected: [6,7,10,11,14,15,18,19],
  p1: 1,
  predicate: function(q) {
    return q.k1.ge(q.param("p1")).and(q.k2.gt(q.param("p1")));
  }
};

var q6 = {
  // (k1 = 1 and k2 = 1) OR (k1 >= 2 and k2 >= 2)
  // We can do this as a multi-range index scan
  name: 'q6',
  queryType: 2,
  expected: [5,6,10,11,14,15,18,19],
  p1: 1, p2: 2,
  predicate: function(q) {
    return (q.k1.eq(q.param("p1")).and(q.k2.eq(q.param("p1"))))
           .or(q.k1.ge(q.param("p2")).and(q.k2.ge(q.param("p2"))));
  }
};

//var queryTests = [q1, q2, q3];
var queryTests = [ q5 , q6 ];

/** Set up domain type */
function mpk1() {};
new mynode.TableMapping('mpk1').applyToClass(mpk1);

/** Define test */
var testQueries = new QueryTest("QueryScanTest", mpk1, queryTests);

module.exports.tests = [testQueries];
