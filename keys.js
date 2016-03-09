var u = require('./util')
var isArray = u.isArray
var isString = u.isString

var extractors = {
  $filter: function (query) {
    var o = {}
    for(var k in query)
      o[k] = true
    return o
  },
  $reduce: function (query) {
    var o = {}
    if(isArray(query.$group))
      query.$group.forEach(function (path) {
        o[isArray(path) ? path[0]: path] = true
      })
    //TODO: check what paths the other reduces touch.

    return o
  },
  $map: function (query) {
    var o = {}
    for(var k in query)
      if(isArray(query[k])) o[query[k][0]] = true
      else if(isString(query[k])) o[query[k]] = true
    return o
  }
}

function merge (a, b) {
  var o = {}
  for(var k in a)
    o[k] = true
  for(var k in b)
    o[k] = true
  return o
}

function first(q) {
  for(var k in q) return k
}

function keys (query) {
  var keys = {}
  for(var i = query.length - 1; i >= 0; i--) {
    var k = first(query[i])
    keys = merge(extractors[k](query[i][k]), keys)
  }
  return keys
}

module.exports = keys
