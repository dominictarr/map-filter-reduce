var u = require('./util')
var isExact = u.isExact
var isRange = u.isRange
var isString = u.isString
var isLtgt = u.isLtgt
var isObject = u.isObject
var has = u.has

function filter(q, v) {
  if(isExact(q)) {
    return q === v
  }
  if(isString(q.$prefix)) {
    if(!isString(v)) return false
    return v.substring(0, q.$prefix.length) === q.$prefix
  }
  else if (isLtgt(q)) {
    var matches = true

    if(has(q, '$lt')   && !(v <  q.$lt))   matches = false
    if(has(q, '$lte')  && !(v <= q.$lte))  matches = false
    if(has(q, '$gt')   && !(v >  q.$gt))   matches = false
    if(has(q, '$gte')  && !(v >= q.$gte))  matches = false

    return matches
  }

  if(!isObject(v)) return false

  for(var k in q)
    if(!has(v, k) || !filter(q[k], v[k])) return false

  return true
}

function createFilter (q) {
  return function (v) {
    return filter(q, v)
  }
}

exports = module.exports = createFilter


