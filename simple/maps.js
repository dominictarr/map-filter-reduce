'use strict'

var u = require('../util')

exports.lt = function (a, b) {
  return a < b
}
exports.gt = function (a, b) {
  return a > b
}
exports.lte = function (a, b) {
  return a <= b
}
exports.gte = function (a, b) {
  return a >= b
}
exports.eq = function (a, b) {
  return a === b
}
exports.ne = function (a, b) {
  return a !== b
}
exports.not = function (a) {
  return !a
}
exports.truthy = function (a) {
  return !!a
}
exports.prefix = function (a, str) {
  if(u.isArray(str))
    return ( u.isArray(a) && a.length > str.length
      && str.every(function (v, i) {
          return a[i] === v
      })
    )
  return 'string' == typeof a && a.substring(0, str.length) == str
}
exports.is = function (a, type) {
  return typeof a === type
}

exports.in = function (a, b) {
  return ~b.indexOf(a)
}

exports.type = function (a) {
  return typeof a
}
exports.int = function (a) {
  return u.isInteger(a)
}
exports.mod = function (a, b) {
  return a % b
}
exports.get = function (a, path) {
  return u.get(a, path)
}




