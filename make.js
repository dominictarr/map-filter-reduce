var u = require('./util')

function isBasicMap (rule) {
  if(u.isString(rule)) return function (value) {
    return value != null ? value[rule] : undefined
  }
  //negative numbers access from the end of the list.
  if(u.isInteger(rule)) return function (value) {
    return rule >= 0 ? value[rule] : value[+value.length + rule]
  }

  if(true === rule)
    return function (value) { return value }
}

function isBasicLiteral (rule) {
  if(u.isBasic(rule))
    return function (v) { return rule === v }
}

function isFun (rule) {
  if(u.isFunction(rule)) return rule
}

function isArrayCompose (rule) {
  if(u.isArray(rule)) {
    var rules = rule.map(make)
    return function (value) {
      return rules.reduce(function (value, fn) {
        return fn(value)
      }, value)
    }
  }
}

function isUnknown(rule) {
  throw new Error('could not process:'+JSON.stringify(rule))
}

function map$ (obj, map) {
  var $obj = {}
  for(var k in obj)
    $obj['$'+k] = map(obj[k])
  return $obj
}

var maps = map$(require('./simple/maps'), function (fn) {
  return function (argument) {
    return function (value) {
      return fn(value, argument)
    }
  }
})

function and (a, b) {
  if(!a) return b
  return function (val) {
    return a(val) && b(val)
  }
}

function isMap(obj) {
  var fn
  for(var k in obj)
    if(maps[k]) fn = and(fn, maps[k].call(make, obj[k]))
  return fn
}

function applyFirst(fns) {
  return function (query) {
    for(var k in query)
      if(fns[k]) return fns[k](query[k], query)
  }
}

var isReduce = applyFirst(map$(require('./simple/reduces'), function (reduce) {
  return function (argument) {
    var get = make(argument)
    return function (a, b) {
      return reduce(a, get(b))
    }
  }
}))

var compare = require('typewiselite')
var search = require('binary-search')

function is$ (obj) {
  for(var k in obj)
    if(k[0] === '$') return true
  return false
}

//rawpaths, reducedpaths, reduce
function arrayGroup (set, get, reduce) {

  //we can use a different lookup path on the right hand object
  //is always the "needle"
  function _compare (hay, needle) {
    for(var i in set) {
      var x = u.get(hay, set[i]), y = needle[i]
      if(x !== y) return compare(x, y)
    }
    return 0
  }

  return function (a, b) {
    if(a && !Array.isArray(a)) a = reduce([], a)
    var A = a = a || []
    var i = search(A, get.map(function (fn) { return fn(b) }), _compare)

    if(i >= 0) A[i] = reduce(A[i], b)
    else       A.splice(~i, 0, reduce(undefined, b))

    return a
  }
}

var special = {
  filter: function makeFilter (rule) {
    if(u.isContainer(rule) && !is$(rule)) { //array or object
      rule = u.map(rule, makeFilter)
      return function (value) {
        if(value == null) return false
        for(var k in rule)
          if(!rule[k](value[k])) return false
        return true
      }
    }

    //now only values at the end...
    return isBasicLiteral(rule) || make(rule)
  },

  map: function makeMap (rule) {
    if(u.isObject(rule) && !is$(rule)) {
      var rules = u.map(rule, makeMap)
      return function (value) {
        if(value == null) return undefined
        var keys = 0
        var ret = u.map(rules, function (fn, key) {
          if(rule[key] === true) {
            keys ++
            return value && value[key]
          }
          keys ++
          return fn(value)
        })
        return keys ? ret : undefined
      }
    }
    return make(rule)
  },

  reduce: function (rule) {
    var gets = [], sets = []
    var reduce = (function makeReduce (rule, path) {
      if(u.isObject(rule) && !is$(rule)) {
        var rules = u.map(rule, function (rule, k) {
          return makeReduce(rule, path.concat(k))
        })
        return function (a, b) {
          if(!a) a = {}
          return u.map(rules, function (reduce, key) {
            return a[key] = reduce.length === 1
                ? reduce(b) : reduce(a[key], b)
          })
        }
      }
      else {
        var fn = make(rule)
        if(fn.length === 1) { gets.push(fn); sets.push(path.length == 1 ? path[0] : path) }
        return fn
      }
    })(rule, [])

    return gets.length
      ? arrayGroup(sets, gets, reduce) : reduce
  }
}

var isSpecial = applyFirst(map$(special, function (fn) {
  return function (query) { return fn(query) }
}))

function make (rule) {
  return isBasicMap(rule) || isFun(rule) || isArrayCompose(rule) ||
    isMap(rule) || isReduce(rule) || isSpecial(rule) || isUnknown(rule)
}

module.exports = make

