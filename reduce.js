var u = require('./util')
var Map = require('./map')
var simple = require('./basic')
var search = require('binary-search')
var compare = require('typewiselite')

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

function multi(query) {
  if(u.isFunction(query)) return query

  return function (a, b) {
    return u.map(query, function traverse (reduce, k) {
      //some reduce functions may be maps (which take one arg)
      return reduce.length == 1 ? reduce(b) : reduce(a[k], b)
    }, a = a || {})
  }
}

//rawpaths, reducedpaths, reduce
function arrayGroup (_g, g, reduce) {

  //we can use a different lookup path on the right hand object
  //is always the "needle"
  //compare(haystay[j], needle)
  function _compare (hay, needle) {
    for(var i in _g) {
      var x = u.get(hay, _g[i]), y = needle[i]
    if(x !== y) return compare(x, y) // < y ? -1 : 1
    }
    return 0
  }

  return function (a, b) {
    if(a && !Array.isArray(a)) a = reduce([], a)
    var A = a = a || []
    var i = search(A, g.map(function (fn) { return fn(b) }), _compare)

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

function make2 (query) {
  var r = isSimple(query)
  if(r) return r
  if(query.$group)
    return objectGroup(query.$group, multi(make2(query.$reduce)))
  if(query.$reduce)
    return make2(query.$reduce)
  if(u.isObject(query))
    return u.map(query, make2)
  return Map(query)
}

function make (query) {
  var r = isSimple(query)
  if(r) return r
  else if(query.$group)
    return objectGroup(query.$group, gmake(query.$reduce))
  else if(u.isObject(query) && !u.isArray(query)) {
    return multi(u.map(query, gmake))
  }
  else return function (a, b) {
    return u.get(b, query)
  }
}

function amake (query) {
  var _query = make2(query)
  if(query.$group)
      return objectGroup(query.$group, make(query.$reduce))
  var r = isSimple(query)
  if(r) return r

  //get the lookup paths, and the paths they will be saved to.
  //these will both be passed to arrayGroup.
  var paths = []
  var _paths = u.paths(_query, function (value) {
    if(u.isFunction(value) && value.length === 1) {
      return paths.push(value), true
    }
  })

  return paths.length ? arrayGroup(_paths, paths, make(query)) : make(query)
}

function gmake (query) {
  if(query.$group && !query.$reduce) throw new Error('expected $reduce')
  return query.$group ? objectGroup(query.$group, gmake(query.$reduce)) : make(query)
}

module.exports = amake




