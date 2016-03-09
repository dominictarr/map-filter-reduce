var tape = require('tape')
var filter = require('../filter')

var data = [
  'string',
  'strength',
  {okay: true},
  {foo: 1, bar: 2},
  {a: {b: 'okay'}},
  {a: {b: 'notokay'}},
  {source: 'a', dest: 'b', rel: ['name', '@bob']},
  {source: 'b', dest: 'a', rel: ['name', '@alice']},
  {source: 'b', dest: 'a', rel: ['contact', true, false]}
]

var queries = [
  'string',
  {okay: true},
  {$prefix: 'str'},
  {a: {b: {$gt:'ok'}}},
  {rel: ['name', {$prefix: '@'}]},
  {rel: ['name', {$prefix: '@b'}]},
  {rel: {$prefix: ['contact', true]}}
]

var expected = [
  ['string'],
  [{okay: true}],
  ['string', 'strength'],
  [{a: {b: 'okay'}}],
  [
    {source: 'a', dest: 'b', rel: ['name', '@bob']},
    {source: 'b', dest: 'a', rel: ['name', '@alice']}
  ],
  [{source: 'a', dest: 'b', rel: ['name', '@bob']}],
  [{source: 'b', dest: 'a', rel: ['contact', true, false]}]
]

tape('okay: true', function (t) {
  t.ok(filter(queries[1])({okay: true}))
  t.end()
})

tape('a: { b: >ok }', function (t) {
  t.ok(filter(queries[3])({a: {b: 'okay'}}))
  t.end()
})

queries.forEach(function (q, i) {
  tape('test filter: '+JSON.stringify(q), function (t) {
    t.deepEqual(data.filter(filter(q)), expected[i])
    t.end()
  })
})


