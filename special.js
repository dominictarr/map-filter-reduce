var u = require('./util')
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

module.exports = function (make) {

  return {
    filter: function makeFilter (rule) {
      if(u.isContainer(rule) && !is$(rule)) {
        rule = u.map(rule, makeFilter)
        return function (value) {
          if(value == null) return false
          for(var k in rule)
            if(!rule[k](value[k])) return false
          return true
        }
      }

      if(u.isBasic(rule))
        return function (v) { return rule === v }

      //now only values at the end...
      return make(rule)
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
      //this traverses the rule THREE TIMES!
      //surely I can do this in one go.
      function makeReduce (rule) {
        if(u.isObject(rule) && !is$(rule) && !u.isArray(rule))
          return u.map(rule, makeReduce)
        return make(rule)
      }

      if(u.isObject(rule) && !is$(rule)) {
        var rules =  u.map(rule, makeReduce)

        var getPaths = []
        var setPaths = u.paths(rules, function (maybeMap) {
          if(u.isFunction(maybeMap) && maybeMap.length === 1) {
            return getPaths.push(maybeMap), true
          }
        })

        var reduce = (function createReduce(rule) {
          if(u.isObject(rule)) {
            var rules = u.map(rule, createReduce)
            return function (a, b) {
              if(!a) a = {}
              return u.map(rules, function (reduce, key) {
                return a[key] = reduce(a[key], b)
              })
            }
          }
          else if(u.isFunction(rule)) {
            if(rule.length === 2) return rule
            else return function (a, b) { return rule(b) }
          }
          else
            throw new Error('could not process:'+JSON.stringify(rule))
        })(rules)

        return getPaths.length
          ? arrayGroup(setPaths, getPaths, reduce) : reduce
      }
      return make(rule)
    }
  }
}

