'use strict'

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
  console.log('EQ', a, b)
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
  return 'string' == typeof a && a.substring(0, str.length) == str
}
exports.is = function (a, type) {
  return typeof a === type
}
exports.type = function (a) {
  return typeof a
}
var u = require('../util')
exports.int = function (a) {
  console.log('integer?', a)
  return u.isInteger(a)
}
exports.mod = function (a, b) {
  return a % b
}
exports.get = function (a, path) {
  return u.get(a, path)
}


