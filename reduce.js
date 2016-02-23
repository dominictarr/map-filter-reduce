var u = require('./util')

//{
//  $group: ['dest', ['rel', 1]]
//  key: {$count: true}
//  field: {$sum:true}
//  $collect: field,
//  $first, $last, $max, $min
//}

var simple = {
  $count:
    function (a, b) {
      if(b === undefined) return (a||0)
      return (a||0)+1
    },
  $sum:
    function (a, b) {
      if(b === undefined) return (a||0)
      return (a||0)+(b||0)
    },
  $max:
    function (a, b) {
      if(b === undefined) a
      if(a === undefined) return b
      return Math.max(a, b)
    },
  $min:
    function (a, b) {
      if(b === undefined) a
      if(a === undefined) return b
      return Math.min(a, b)
    },
  $collect:
    function (a, b) {
      if(!a) a = a || []
      if(!u.isArray(a)) a = [a]
      if(b == undefined) return a
      a.push(b)
      return a
    }
}

function isSimple(query) {
  for(var k in simple) {
    if(u.has(query, k)) return k
  }
}


function isFunction (f) { return 'function' === typeof f }

function nonGroup (query) {
  var k
  if(k=isSimple(query)) return simple[k]
  else if(u.isObject(query)) {
    var o = {}
    for(var k in query) (function (k, q, r) {
      if(k == '$group') return
      var reducer = simple[r]
      if(!isFunction(reducer)) {
        throw new Error('!reducer')
      }
      var path = q[r]
      if(path === true) path = k
      o[k] = function (a, b) {
        return reducer(a, u.get(b, path))
      }
    })(k, query[k], isSimple(query[k]))

    var first = true
    return function reduce (a, b, i) {
      a = a || {}
      for(var k in o) {
        a[k] = o[k](a[k], b)
      }
      return a
    }
  }
}

function each(list, iter) {
  if(u.isString(list)) return iter(list)
  for(var i = 0; i < list.length; i++)
    iter(list[i])
}

function group (query) {
  var g = query.$group
  var reduce = nonGroup(query)
  return function (a, b) {
    var k = u.get(b, g)
    a = a || {}
    a[k] = reduce(a[k], b)
    return a
  }
}

module.exports = function reduce (query) {
  return query.$group ? group(query) : nonGroup(query)
}











