var tape = require('tape')
var project = require('../util').project
var paths = require('../util').paths

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

tape('paths', function (t) {
  t.deepEqual(paths(input, function (e) { return e===true }), [['foo', 'bar'], ['foofoo', 'okay']])
  t.end()
})
