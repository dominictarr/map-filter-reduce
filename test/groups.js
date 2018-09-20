var tape = require('tape')

var r = require('../make')
var numbers = [1,2,3,4,5]

function R(query) {
  return r({$reduce:query})
}


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



tape('primitive properties', function (t) {
  return t.end()
  t.deepEqual(
    groups.reduce(R({
      length: ['name', 'length'],
      country: {$count: true}
    }), null),

    [ { country: 1, length: 3 },
      { country: 1, length: 4 },
      { country: 1, length: 6 },
      { country: 1, length: 7 },
      { country: 1, length: 8 } ]
  )

  t.end()
})




tape('first initial', function (t) {

  t.deepEqual(
    groups.reduce(R({
      initial: ['name', 0],
      count: {$count: true}
    }), null),
    [
      { count: 2, initial: 'd' },
      { count: 1, initial: 'm' },
      { count: 1, initial: 'p' },
      { count: 1, initial: 's' }
    ]
  )
  t.end()
})

