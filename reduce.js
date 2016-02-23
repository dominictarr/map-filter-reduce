var u = require('./util')
var map = u.map
var simple = require('./basic')

function isFunction (f) { return 'function' === typeof f }

function isSimple(query) {
  for(var k in simple) if(u.has(query, k)) return k
}

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

function make (query) {
  var k = isSimple(query)
  if(k) return lookup(simple[k], query[k])
  else if(u.isObject(query))
    return multi(map(query, function (q, k) {
      if(k == '$group') return undefined
      return make(query[k])
    }))
}

function each(list, iter) {
  if(u.isString(list)) return iter(list)
  for(var i = 0; i < list.length; i++)
    iter(list[i], (list.length - i - 1))
}

//instead of taking the query,
//this should take a path, and a reduce function.
function group (g, reduce) {
  return function (a, b) {
    var A = a = a || {}
    each(g, function (k, notLast) {
      var v = u.get(b, k)
      A[v] = !notLast ? reduce(A[v], b) : A[v] || {}
      A = A[v]
    })
    return a
  }
}

module.exports = function reduce (query) {
  return query.$group ? group(query.$group, make(query)) : make(query)
}

