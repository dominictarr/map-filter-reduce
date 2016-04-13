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
  {foo:  0, bar: 1, baz: false, other: 'sometimes'},
  {foo: 10, bar: 2, baz: true, other: true},
  {foo: -5, bar: 3, baz: true},
  {foo: -5, bar: 4, baz: false, other: {okay: true}},
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
      baz: 'baz', count: {$count: true}
    }), null),
    [
      {baz: false, count: 2},
      {baz: true, count: 3}
    ]
  )
  return t.end()
  t.deepEqual(
    objs.reduce(R({
      $group: 'baz', $reduce: {foo: {$max:'foo'}, bar: {$sum: 'bar'}}
    }), null),
    {"true": {foo: 10, bar: 10}, "false": {foo: 0, bar: 5}}
  )

  t.deepEqual(
    objs.reduce(R({
      $group: 'baz', $reduce: {foo: {$max:'foo'}, bar: {$collect: 'bar'}}
    }), null),
    {"true": {foo: 10, bar: [2,3,5]}, "false": {foo: 0, bar: [1,4]}}
  )

  t.end()
})

tape('group, sometimes', function (t) {

  t.deepEqual(
    objs.reduce(R({
      other: ['other', 'okay'],
      values: {$collect: 'other'}
    }), null),
    [
      {other: true, values: [{okay: true}]},
      {other: undefined, values: ['sometimes', true, undefined, undefined]}
    ]
  )

  t.end()
})

var groups = [
  {
    name: 'pfraze', country: 'US', dwelling: 'apartment'
  },
  {
    name: 'substack', country: 'US', dwelling: 'house'
  },
  {
    name: 'mix', country: 'NZ', dwelling: 'house'
  },
  {
    name: 'du5t', country: 'US', dwelling: 'apartment'
  },
  {
    name: 'dominic', country: 'NZ', dwelling: 'sailboat'
  }
]

tape('more groups', function (t) {
  t.deepEqual(groups.reduce(R({
      country: 'country', dwelling: 'dwelling', people: {$collect: 'name'}
    }), null), [
    {
      country: 'NZ', dwelling: 'house', people: ['mix']
    },
    {
      country: 'NZ', dwelling: 'sailboat', people: ['dominic']
    },
    {
      country: 'US', dwelling: 'apartment', people: ['pfraze', 'du5t']
    },
    {
      country: 'US', dwelling: 'house', people: ['substack']
    }
  ])
  t.end()
})


tape('more groups, object', function (t) {
  t.deepEqual(groups.reduce(R({
      $group: ['country', 'dwelling'],
      $reduce: {$collect: 'name'}
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

tape('nested object groups', function (t) {
  t.deepEqual(
    groups.reduce(R({
      $group: 'country',
      $reduce: {
        population: {$count: true},
        housing: {$group: 'dwelling', $reduce: { $count: true }}
      }
    }), null),
    { US: { population: 3, housing: { apartment: 2, house: 1 } },
      NZ: { population: 2, housing: { house: 1, sailboat: 1 } } }
  )
  t.end()
})

tape('nested array groups', function (t) {

  t.deepEqual(
    groups.reduce(R({
      dwelling: 'dwelling',
      citizens: {$reduce:  {
        name: 'name', country: 'country'
      }}
    }), null),
    [
      {dwelling: 'apartment', citizens: [
        {name: 'du5t', country: 'US'},
        {name: 'pfraze', country: 'US'}
      ]},
      {dwelling: 'house', citizens: [
        {name: 'mix', country: 'NZ'},
        {name: 'substack', country: 'US'}
      ]},
      {dwelling: 'sailboat', citizens: [
        {name: 'dominic', country: 'NZ'}
      ]}
    ]
  )
  t.end()
})

tape('nested array groups', function (t) {

  t.deepEqual(
    groups.reduce(R({
      dwelling: 'dwelling',
      citizens: {$group: 'country', $reduce:  {
        $count: true
      }}
    }), null),
    [
      {dwelling: 'apartment', citizens: {US: 2}},
      {dwelling: 'house', citizens: {NZ: 1, US: 1}},
      {dwelling: 'sailboat', citizens: {NZ: 1}}
    ]
  )
  t.end()
})

