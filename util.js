'use strict'

function isString(s) { return 'string' === typeof s }

function isNumber(n) { return !isNaN(+n) }

function isBoolean (b) { return 'boolean' === typeof b }

function isBasic (p) { return isString(p) || isNumber(p) || isBoolean(p) }

function isFunction (f) { return 'function' === typeof f }

var isArray = Array.isArray

function isObject (o) { return o && 'object' === typeof o && !isArray(o) }

function has(o, k) {
  return Object.hasOwnProperty.call(o, k)
}

function isExact (v) {
  if(isBasic(v)) return true
  if(isArray(v))
    return v.every(isExact)
  return isObject(v) && has(v, '$eq')
}

function isLtgt (v) {
  return has(v, '$lt') || has(v, '$gt') || has(v, '$lte') || has(v, '$gte')
}

function isRange (v) {
  if(v == null) return false
//  if(!isObject(v)) return false
  if(v.$prefix) return true
  if(isArray(v)) return find(v, isRange)
  return isLtgt(v)
}

function find (ary, test) {
  for(var i = 0; i < ary.length; i++)
    if(test(ary[i], i, ary)) return true
  return false
}

function lower (v) {
  if(isBasic(v)) return v
  if(isObject(v)) {
    if(isArray(v.$prefix)) return v.$prefix.concat(exports.HI)
    if(isString(v.$prefix)) return v.$prefix
    if(has(v, '$gt')) return v.$gt
    if(has(v, '$gte')) return v.$gte
  }
  if(isArray(v)) return v.map(lower)
}

function upper (v) {
  if(isBasic(v)) return v
  if(isObject(v)) {
    if(isArray(v.$prefix)) return v.$prefix.concat(exports.LO)
    if(isString(v.$prefix)) return v.$prefix+'\uffff'
    if(has(v, '$le')) return v.$lt
    if(has(v, '$lte')) return v.$lte
  }
  if(isArray(v)) return v.map(upper)
}

function get(obj, path) {
  if(isString(path)) return obj[path]
  if(isArray(path)) {
    for(var i = 0; i < path.length; i++) {
      if(obj == null) return undefined
      obj = obj[path[i]]
    }
    return obj
  }
  if(path === true) return obj
  return undefined
}

function map(obj, iter, o) {
  if(Array.isArray(obj)) return obj.map(iter)
  o = o || {}
  for(var k in obj)
    o[k] = iter(obj[k], k, obj)
  return o
}


function mapa(obj, iter) {
  if(Array.isArray(obj)) return obj.map(iter)
  var a = []
  for(var k in obj) {
    var v = iter(obj[k], k, obj)
    if(v !== undefined) a.push(v)
  }
  return a

}

function each(obj, iter) {
  if(Array.isArray(obj)) return obj.forEach(iter)
  else if(isObject(obj))
    for(var k in obj) iter(obj[k], k, obj)
  else
    iter(obj)
}

function project (value, map, isObj) {
  isObj = isObj || isObject
  if(!isObj(value))
    return map(value)
  else {
    var o
    for(var k in value) {
      var v = project(value[k], map, isObj)
      if(v !== undefined)
        (o = o || {})[k] = v
    }
    return o
  }
}

//get all paths within an object
//this can probably be optimized to create less arrays!
function paths (object, test) {
  var p = []
  if(test(object)) return []
  for(var key in object) {
    var value = object[key]
    if(test(value)) p.push(key)
    else if(isObject(value))
      p = p.concat(paths(value, test).map(function (path) {
        return [key].concat(path)
      }))
  }
  return p
}

exports.isString = isString
exports.isNumber = isNumber
exports.isBasic = isBasic
exports.isArray = isArray
exports.isObject = isObject
exports.isRange = isRange
exports.isExact = isExact
exports.isLtgt = isLtgt
exports.isFunction = isFunction

exports.has     = has
exports.get     = get
exports.map     = map
exports.mapa    = mapa
exports.project = project
exports.paths   = paths
exports.each    = each

exports.upper = upper
exports.lower = lower

exports.HI = undefined
exports.LO = null









