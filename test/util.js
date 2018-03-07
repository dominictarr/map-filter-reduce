

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
  t.ok(u.isRange({$lt: 'a'}))
  t.equal(u.upper({$lt: 'a'}), 'a')
  t.end()
})




