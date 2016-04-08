var tape = require('tape')
var u = require('../util')
var project = u.project
var paths = u.paths

var input = {
  foo: {bar: true, baz: false},
  baz: false,
  foofoo: {whatever: false, okay: true}
}

//extract just the parts of the object that are true,
//or support something that is true.
var expected = {
  foo: {bar: true},
  foofoo: {okay: true}
}

var expected_inverse =
{ baz: false, foo: { baz: false }, foofoo: { whatever: false } }

function isObject (o) {
  return o && 'object' === typeof o
}


function toMap(test) {
  return function (value) {
    return test(value) ? value : undefined
  }
}

tape('simple', function (t) {

  t.deepEqual(project(input, toMap(Boolean)), expected)
  t.deepEqual(project(input, toMap(function (e) { return e===false })), expected_inverse)

  t.end()
})

function truth (e) { return e === true }
function untruth (e) { return e === false }

function not(fn) {
  return function (v) { return !fn(v) }
}

var input2 = {
  foo: {bar: true, baz: false},
  baz: false,
  foofoo: {whatever: false, okay: true},
  numbers: [1,2,3]
}

tape('paths', function (t) {
  t.deepEqual(paths(input2, truth), [['foo', 'bar'], ['foofoo', 'okay']])
  t.deepEqual(paths(input2, untruth), [['foo', 'baz'],'baz', ['foofoo', 'whatever']])
  t.deepEqual(paths(input2, u.isObject), [])
  t.deepEqual(paths(input2, u.isBasic), [
    [ 'foo', 'bar' ], [ 'foo', 'baz' ], 'baz',
    [ 'foofoo', 'whatever' ], [ 'foofoo', 'okay' ] ]
  )
  t.deepEqual(paths({okay: true}, truth), ['okay'])
  t.deepEqual(paths({okay: true}, untruth), [])
  t.end()
})


