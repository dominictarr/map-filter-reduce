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
    if(isString(v.$prefix)) return v.$prefix
    if(has(v, '$lt')) return v.$lt
    if(has(v, '$lte')) return v.$lte
  }
  if(isArray(v)) return v.map(lower)
}

function upper (v) {
  if(isBasic(v)) return v
  if(isObject(v)) {
    if(isString(v.$prefix)) return v.$prefix+'\uffff'
    if(has(v, '$gt')) return v.$gt
    if(has(v, '$gte')) return v.$gte
  }
  if(isArray(v)) return v.map(upper)
}

exports.isString = isString
exports.isBasic = isBasic
exports.isArray = isArray
exports.isObject = isObject
exports.isRange = isRange
exports.isExact = isExact
exports.isLtgt = isLtgt
exports.has = has

exports.upper = upper
exports.lower = lower

exports.HI = undefined
exports.LO = null
