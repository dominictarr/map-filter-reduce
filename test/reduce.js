var tape = require('tape')
var R = require('../reduce')
var numbers = [1,2,3,4,5]

tape('easy', function (t) {
  t.equal(numbers.reduce(R({$count: true})), 5)
  t.equal(numbers.reduce(R({$sum: true})), 15)
  t.equal(numbers.reduce(R({$max: true})), 5)
  t.equal(numbers.reduce(R({$min: true})), 1)
  t.deepEqual(numbers.reduce(R({$collect: true})), numbers)
  t.end()
})

var objs = [
  {foo:  0, bar: 1, baz: false},
  {foo: 10, bar: 2, baz: true},
  {foo: -5, bar: 3, baz: true},
  {foo: -5, bar: 4, baz: false},
  {foo:  3, bar: 5, baz: true}
]

tape('objects', function (t) {
  t.deepEqual(
    objs.reduce(R({
      maxFoo: {$max: 'foo'},
      foo: {$sum: 'foo'},
      bar: {$sum: 'bar'}
    }), null),
    {maxFoo: 10, foo: 3, bar: 15}
  )

  t.end()
})

tape('collect', function (t) {
  t.deepEqual(
    objs.reduce(R({
      primes: {$collect: 'baz'}
    }), null),
    {primes: [false, true, true, false, true]}
  )

  t.deepEqual(
    objs.reduce(R({
      $collect: 'baz'
    }), null),
    [false, true, true, false, true]
  )

  t.end()

})

tape('group', function (t) {

  t.deepEqual(
    objs.reduce(R({
      $group: 'baz', $count: true
    }), null),
    {"true": 3, "false": 2}
  )

  t.deepEqual(
    objs.reduce(R({
      $group: 'baz', foo: {$max:'foo'}, bar: {$sum: 'bar'}
    }), null),
    {"true": {foo: 10, bar: 10}, "false": {foo: 0, bar: 5}}
  )

  t.deepEqual(
    objs.reduce(R({
      $group: 'baz', foo: {$max:'foo'}, bar: {$collect: 'bar'}
    }), null),
    {"true": {foo: 10, bar: [2,3,5]}, "false": {foo: 0, bar: [1,4]}}
  )

  t.end()
})

var groups = [
  {
    name: 'pfraze', country: 'US', house: 'apartment'
  },
  {
    name: 'substack', country: 'US', house: 'house'
  },
  {
    name: 'mix', country: 'NZ', house: 'house'
  },
  {
    name: 'du5t', country: 'US', house: 'apartment'
  },
  {
    name: 'dominic', country: 'NZ', house: 'sailboat'
  }
]

tape('more groups', function (t) {
  t.deepEqual(groups.reduce(R({
      $group: ['country', 'house'],
      $collect: 'name'
    }), null),
    {
      US: {
        apartment: ['pfraze', 'du5t'],
        house: ['substack']
      },
      NZ: {
        house: ['mix'],
        sailboat: ['dominic']
      }
    }
  )
  t.end()
})

tape('nested groups', function (t) {
  t.deepEqual(
    groups.reduce(R({
      $group: 'country',
      population: {$count: true},
      housing: {$group: 'house', $count: true}
    }), null),
    { US: { population: 3, housing: { apartment: 2, house: 1 } },
      NZ: { population: 2, housing: { house: 1, sailboat: 1 } } }
  )
  t.end()
})

