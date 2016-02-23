var u = require('./util')

var simple = require('./basic')

function isFunction (f) { return 'function' === typeof f }

function isSimple(query) {
  for(var k in simple) if(u.has(query, k)) return k
}

function lookup(reduce, path) {
  return function (a, b) {
    return reduce(a, u.get(b, path))
  }
}

//TODO: the below code is a bit ugly, because it's
//coupled to the DSL - it would be more elegant to rewrite
//interms of functions. functions that create reduce functions
//and take reduce functions as arguments "lookup" is a simple example...

function map(obj, iter, o) {
  o = o || {}
  for(var k in obj) {
    var v = iter(obj[k], k, obj)
    if(v !== undefined) o[k] = v
  }
  return o
}

function multi(obj) {
  return function (a, b) {
    return map(obj, function (reduce, k) {
      return reduce(a[k], b)
    }, a = a || {})
  }
}

function makeMulti (query) {
  return multi(map(query, function (q, k) {
    if(k == '$group') return undefined
    var r = isSimple(query[k]), path = q[r]
    return lookup(simple[r], path === true ? k : path)
  }))
}

function auto (query, key) {
  var k

  if(k=isSimple(query)) {
    console.log('simple', k, query[k])
    return lookup(simple[k], query[k])
  }
  else if(u.isObject(query)) return makeMulti(query)
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
  return query.$group ? group(query.$group, auto(query)) : auto(query)
}

