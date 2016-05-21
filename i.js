var u = require('./util')
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

var reduces = map$(require('./simple/reduces'), function (reduce) {
  return function (argument) {
    var get = make(argument)
    return function (a, b) {
      return reduce(a, get(b))
    }
  }
})

var specials = map$(require('./special')(make), function (fn) {
  return function (query) {
    return fn.call(make, query)
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

function isReduce(obj) {
  for(var k in obj)
    if(reduces[k])
      return reduces[k].call(make, obj[k], obj)
}

function isSpecial(query) {
  for(var k in query)
    if(specials[k])
      return specials[k].call(make, query[k], query)
}

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

function make (rule) {
  return isBasicMap(rule) || isFun(rule) || isArrayCompose(rule) ||
    isMap(rule) || isReduce(rule) || isSpecial(rule) ||
    (function () {
      throw new Error('could not process:'+JSON.stringify(rule))
    })()
}

module.exports = make


