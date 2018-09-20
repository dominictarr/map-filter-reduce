var tape = require('tape')
var make = require('../make')

function filter(query) {
  return make({$filter: query})
}

var data = [
  'string',
  'strength',
  {okay: true},
  {foo: 1, bar: 2},
  {a: {b: 'okay'}},
  {a: {b: 'notokay'}},
  {source: 'a', dest: 'b', rel: ['name', '@bob']},
  {source: 'b', dest: 'a', rel: ['name', '@alice']},
  {source: 'b', dest: 'a', rel: ['contact', true, false]},
  {source: 'b', dest: 'a', rel: ['contact', false, null]},
  {source: 'x', dest: 'a', rel: ['age', false, null]},
  true,
  false
]

var queries = [
  'string',
  {okay: true},
  {$prefix: 'str'},
  {a: {b: {$gt:'ok'}}},
  {rel: ['name', {$prefix: '@'}]},
  {rel: ['name', {$prefix: '@b'}]},
  {rel: {$prefix: ['contact', true]}},
  {rel: ['contact', {$is: 'boolean'}]},
  {$is: 'boolean'},
  {$is: 'string'},
  {source: {$in: ['x', 'a']}},
  {rel: [{$in: ['name', 'age']}]}
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
  [{source: 'b', dest: 'a', rel: ['contact', true, false]}],
  [
    {source: 'b', dest: 'a', rel: ['contact', true, false]},
    {source: 'b', dest: 'a', rel: ['contact', false, null]}
  ],
  [true, false],
  ['string', 'strength'],
  [
    {source: 'a', dest: 'b', rel: ['name', '@bob']},
    {source: 'x', dest: 'a', rel: ['age', false, null]},
  ],
  [
    {source: 'a', dest: 'b', rel: ['name', '@bob']},
    {source: 'b', dest: 'a', rel: ['name', '@alice']},
    {source: 'x', dest: 'a', rel: ['age', false, null]},
  ]
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


var mfr = require('..')
var pull = require('pull-stream')
queries.forEach(function (q, i) {
  tape('test filter: '+JSON.stringify(q), function (t) {
    pull(
      pull.values(data),
      mfr([{$filter: q}]),
      pull.collect(function (err, results) {
        t.deepEqual(results, expected[i])
        t.end()
      })
    )
  })
})

tape('sort', function (t) {
  pull(
    pull.values(data),
    mfr([{
      $filter: {
        rel: ['name']
      }}, {
      $sort: [
        ['rel', 0],
        ['rel', 1],
        ['source'],
        ['dest']
      ]}
    ]),
    pull.collect(function (err, results) {
      t.deepEqual(results, [
        {source: 'b', dest: 'a', rel: ['name', '@alice']},
        {source: 'a', dest: 'b', rel: ['name', '@bob']}
      ])
      t.end()
    })
  )
})

