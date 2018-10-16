

var tape = require('tape')

var u = require('../util')

var ranges = [
  {$gte: 'a'},
  {$prefix: 'a'},
  {$prefix: ['a', 'b']},
  ['ab', {$prefix: 'c'}]
]

tape('u', function (t) {
  ranges.map(function (e) {
    t.ok(u.isRange(e))
  })
  t.end()

})

tape('ranges', function (t) {
  function r(range, upper, lower) {
    t.ok(u.isRange(range), JSON.stringify(range) + ' is a range')
    t.deepEqual(u.upper(range), upper)
    t.deepEqual(u.lower(range), lower)
  }
  r({$lt:  'a'}, 'a', null)
  r({$lte: 'a'}, 'a', null)
  r({$gt:  'a'}, undefined, 'a')
  r({$gte: 'a'}, undefined, 'a')

  r({$lt:  7}, 7, null)
  r({$lte: 7}, 7, null)
  r({$gt:  7}, undefined, 7)
  r({$gte: 7}, undefined, 7)

  r({$is: 'string'}, [], '')
  r({$is: 'boolean'}, true, false)
  r({$is: 'array'}, undefined, [])
  r({$is: 'undefined'}, undefined, undefined)
  r({$is: 'null'}, null, null)

  t.end()
})

tape('!isRange', function (t) {
  function r(not_range) {
    t.notOk(u.isRange(not_range), JSON.stringify(not_range)+ ' is not a range')
  }
  r({$ne: 'foo'})
  t.end()
})
tape('!isExact', function (t) {
  function r(not_exact) {
    t.notOk(u.isExact(not_exact), JSON.stringify(not_exact)+ ' is not exact')
  }
  r({$ne: 'foo'})
  t.end()
})
