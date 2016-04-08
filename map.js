var u = require('./util')
var map = u.map

function id (v, k) {
  return k ? v[k] : v
}

function isNull (n) {
  return n == null
}

function key(q) {
  return function (v) {
    if(isNull(v)) return undefined
    return v[q]
  }
}

function path (q) {
  return q.reduce(function (map1, map2) {
    return function (v) { return map2(map1(v)) }
  })
}

function notEmpty (o) {
  for(var k in o) return o
  return undefined
}

function obj (q) {
  return function (v) {
    if(isNull(v)) return undefined
    return notEmpty(map(q, function (fn, k, o) {
      return fn(v, k)
    }))
  }
}

function make(q) {
  if(true === q) return id
  if(isNull(q)) return isNull
  if(u.isString(q) || u.isNumber(q)) return key(q)
  if(u.isArray(q)) return path(q.map(make))
  if(u.isObject(q)) return obj(map(q, make))
  throw new Error('no match - should never happen')
}

module.exports = make

