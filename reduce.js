var u = require('./util')
var map = u.map
var simple = require('./basic')
var search = require('binary-search')

function isFunction (f) { return 'function' === typeof f }

function isSimple(query) {
  if(query.$reduce) return amake(query.$reduce)
  for(var k in simple) if(u.has(query, k)) return lookup(simple[k], query[k])
}

//this should be a reduce and a map
function lookup(reduce, path) {
  if(path === true) return reduce
  return function (a, b) {
    return reduce(a, u.get(b, path))
  }
}

function multi(obj) {
  return function (a, b) {
    return map(obj, function (reduce, k) {
      return reduce(a[k], b)
    }, a = a || {})
  }
}

function arrayGroup (g, reduce) {

  function compare (a, b) {
    for(var i in g) {
      var x = u.get(a, g[i])
      var y = u.get(b, g[i])
      if(x != y) return x < y ? -1 : 1
    }
    return 0
  }

  return function (a, b) {
    var A = a = a || []
    var i = search(A, b, compare)

    if(i >= 0) A[i] = reduce(A[i], b)
    else       A.splice(~i, 0, reduce(undefined, b))

    return a
  }
}

function objectGroup (g, reduce) {
  if('string' === typeof g) g = [g]
  return function (a, b) {
    var A = a = a || {}
    u.each(g, function (k, i) {
      var last = (i == (g.length - 1))
      var v = u.get(b, k)
      A[v] = last ? reduce(A[v], b) : A[v] || {}
      A = A[v]
    })
    return a
  }
}


function make (query) {
  var r = isSimple(query)
  if(r) return r
  else if(query.$group)
    return objectGroup(query.$group, gmake(query.$reduce))
  else if(u.isObject(query)) {
    return multi(map(query, gmake))
  }
  else return function (a, b) {
    return b[query]
  }
}


function amake (query) {
  if(query.$group) return objectGroup(query.$group, make(query.$reduce))

  var r = isSimple(query)
  if(r) return r

  var paths = []
  u.each(query, function traverse (value) {
    if(isSimple(value) || value.$group || value.$reduce) return
    else if(u.isObject(value)) each(value, traverse)
    else if(value) paths.push(value)
  })

  return paths.length ? arrayGroup(paths, make(query)) : make(query)
}

function gmake (query) {
  if(query.$group && !query.$reduce) throw new Error('expected $reduce')
  return query.$group ? objectGroup(query.$group, gmake(query.$reduce)) : make(query)
}

module.exports = amake

