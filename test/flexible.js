
var make = require('../make')
var tape = require('tape')

tape('simple', function (t) {
  t.equal(make('foo')({foo: true}),  true)
  t.equal(make(['foo', {$type: true}])({foo: true}),  'boolean')
  t.equal(make(['foo', {$type: true}, {$eq: 'boolean'}])({foo: true}),  true)
  t.equal(make({$gt: 1, $lt: 3})(2), true)
  t.equal(make({$gt: 1, $lt: 3})(4), false)
  t.equal(make([{$mod: 2}, {$not: true}])(4), true)

  t.end()
})

tape('filter, map', function (t) {

  t.equal(
    make({$filter: 'foo'}) ('foo'),
    true
  )

  t.equal(
    make({$filter: {foo: {$lt: 0}, bar: {$gt: 0}}})
      ({foo: -1, bar: 1}),
    true
  )

  t.deepEqual(
    make({$map: {
      foo_lt_1: ['foo', {$lt: 0}], bar_gt2: ['bar', {$gt: 2}]
    }})
      ({foo: -1, bar: 1}),
    {foo_lt_1: true, bar_gt2: false}
  )

  t.end()
})


tape('reduce', function (t) {
  t.deepEqual(
    [1,2,3].reduce(make({
      $reduce: {
        total: {$sum: true},
        count: {$count: true},
        product: {$product: true}
      }
    }), null),
    {total: 6, count: 3, product: 6}
  )
  t.end()
})

tape('reduce with group', function (t) {
  t.deepEqual(
    [1,1.3, 2, 2.6, 3].reduce(make({
      $reduce: {
        integer: {$int: 1},
        count: {$count: true},
        product: {$product: true}
      }
    }), null),
    [
      { count: 2, integer: false, product: 3.3800000000000003 },
      { count: 3, integer: true, product: 6 }
    ]
  )
  t.end()
})

