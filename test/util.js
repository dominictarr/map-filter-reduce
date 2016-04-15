

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




