
var tape = require('tape')
var keys = require('../keys')
//extract the keys used in a query

var input = [
  [{$filter: {rel: ['mentions', {$prefix: '@d'}]}}],
  [{$filter: {rel: ['mentions', {$prefix: ''}], dest: {$prefix: "%"}}}],
  [
    {"$filter": {
      "dest": {"$prefix": "&"},
      "rel": ["mentions", {"$prefix": ""}, {"$gt": 50000}]
    }},
    {"$map": {
      "blob": "dest",
      "name": ["rel", 1],
      "size": ["rel", 2]
    }}
  ],
  [
    {"$filter": {
      "rel": ["root"]
    }},
    {"$reduce":{
      "$group": ["dest", "source"], "$count": true
    }}
  ]
]

var output = [
  {rel: true},
  {rel: true, dest: true},
  {dest: true, rel: true},
  {rel: true, dest: true, source: true}
]

tape('test inputs', function (t) {
  for(var i = 0; i < input.length; i++) {
    t.deepEqual(keys(input[i]), output[i])
  }
  t.end()
})

