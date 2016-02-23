
var tape = require('tape')
var map = require('../map')
var inputs = [
  'string'
]

tape('map', function (t) {
  t.deepEqual(map(true, true), true)
  t.deepEqual(map(true, false), false)
  t.deepEqual(map('key', {key: 1}), 1)
  t.deepEqual(map({foo: true}, {foo: 1, bar: 2}), {foo: 1})
  t.deepEqual(map({bar: 'bar'}, {foo: 1, bar: 2}), {bar: 2})
  t.deepEqual(map({f: 'bar', b: 'foo'}, {foo: 1, bar: 2}), {f: 2, b: 1})
  t.deepEqual(map(
    {abc: ['a', 'b', 'c', {foo: true, bar: true}]},
    {a: {b: {c: {foo:1, bar:2, baz: 3}}}}
  ), {abc: {foo:1, bar: 2}})
  t.end()
})

tape('badmap', function (t) {
  t.deepEqual(map('key', 'string'), undefined)
  t.deepEqual(map({foo: true}, {bar:1, baz:2}), undefined)
  t.deepEqual(map({foo: true}, null), undefined)
  t.deepEqual(map(['a', 'b', 'c'], {a: true}), undefined)
  t.end()
})












