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

//rawpaths, reducedpaths, reduce
function arrayGroup (_g, g, reduce) {

  //we can use a different lookup path on the right hand object
  //is always the "needle"
  //compare(haystay[j], needle)
  function compare (hay, needle) {
    for(var i in _g) {
      var x = u.get(hay, _g[i]), y = needle[i]
     if(x != y) return x < y ? -1 : 1
    }
    return 0
  }

  return function (a, b) {
    var A = a = a || []
    var i = search(A, g.map(function (p) { return u.get(b, p) }), compare)

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
  else if(u.isObject(query) && !u.isArray(query)) {
    return multi(map(query, gmake))
  }
  else return function (a, b) {
    return u.get(b, query)
  }
}


function amake (query) {
  if(query.$group) return objectGroup(query.$group, make(query.$reduce))

  var r = isSimple(query)
  if(r) return r

  //get the lookup paths, and the paths they will be saved to.
  //these will both be passed to arrayGroup.
  var paths = [], _paths =
  u.mapa(query, function traverse (value, key) {
    if(isSimple(value) || value.$group || value.$reduce) return
    else if(u.isObject(value) && !u.isArray(value))
      return u.mapa(value, traverse).map(function (path) {
        return [key].concat(path)
      })
    else if(value) {
      paths.push(value)
      return [key]
    }
  })
  //I don't understand exactly why i need this line but i do
  if(_paths.length == 1 && u.isArray(_paths[0])) _paths = _paths[0]

  console.log('PATHS', _paths, '<=', paths)
  return paths.length ? arrayGroup(_paths, paths, make(query)) : make(query)
}

function gmake (query) {
  if(query.$group && !query.$reduce) throw new Error('expected $reduce')
  return query.$group ? objectGroup(query.$group, gmake(query.$reduce)) : make(query)
}

module.exports = amake










