'use strict'
function isString(s) { return 'string' === typeof s }

function isNumber(n) { return !isNaN(+n) }

function isBoolean (b) { return 'boolean' === typeof b }

function isBasic (p) { return isString(p) || isNumber(p) || isBoolean(p) }

var isArray = Array.isArray

function isObject (o) { return o && 'object' === typeof o }

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
  if(!isObject(v)) return false
  if(isString(v.$prefix)) return true
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
    if(has(v, '$lt')) return v.$lt
    if(has(v, '$lte')) return v.$lte
  }
  if(isArray(v)) return v.map(lower)
}

function upper (v) {
  if(isBasic(v)) return v
  if(isObject(v)) {
    if(isArray(v.$prefix)) return v.$prefix.concat(exports.LO)
    if(isString(v.$prefix)) return v.$prefix+'\uffff'
    if(has(v, '$gt')) return v.$gt
    if(has(v, '$gte')) return v.$gte
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
  for(var k in obj) {
    var v = iter(obj[k], k, obj)
    if(v !== undefined) o[k] = v
  }
  return o
}

exports.isString = isString
exports.isNumber = isNumber
exports.isBasic = isBasic
exports.isArray = isArray
exports.isObject = isObject
exports.isRange = isRange
exports.isExact = isExact
exports.isLtgt = isLtgt

exports.has = has
exports.get = get
exports.map = map

exports.upper = upper
exports.lower = lower

exports.HI = undefined
exports.LO = null
