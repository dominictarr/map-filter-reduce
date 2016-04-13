
var tape = require('tape')
var make = require('../map')
var inputs = [
  'string'
]

function map(q, v) {
  return make(q)(v)
}

tape('map', function (t) {
  t.deepEqual(map(true, true), true)
  t.deepEqual(map(true, false), false)
  t.deepEqual(map('key', {key: 1}), 1)
  t.deepEqual(map({foo: true}, {foo: 1, bar: 2}), {foo: 1})
  t.deepEqual(map({bar: 'bar'}, {foo: 1, bar: 2}), {bar: 2})
  t.deepEqual(map({f: 'bar', b: 'foo'}, {foo: 1, bar: 2}), {f: 2, b: 1})
  t.deepEqual(map(
    {foo: true, bar: true},
    {foo:1, bar:2, baz: 3}
  ), {foo:1, bar: 2})
  t.deepEqual(map(
    {abc: ['a', 'b', 'c', true]}, //{foo: true, bar: true}
    {a: {b: {c: {foo:1, bar:2, baz: 3}}}}
  ), {abc: {foo:1, bar: 2, baz: 3}})
  t.end()
})

tape('array is repeated map', function (t) {
  t.deepEqual(map(
    ['a', 'b', 'c'],
    {a: {b: {c: {foo:1, bar:2}}}}
  ), {foo:1, bar: 2})
  t.end()
})

tape('badmap', function (t) {
  t.deepEqual(map('key', 'string'), undefined)
  t.deepEqual(map({foo: true}, {bar:1, baz:2}), {foo: undefined})
  t.deepEqual(map({foo: true}, null), undefined)
  t.deepEqual(map(['a', 'b', 'c'], {a: true}), undefined)
  t.end()
})



