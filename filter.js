
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
    return !find(v, isRange)
  return isObject(v) && has(v, '$eq')
}

function isLtgt (v) {
  return has(v, '$lt') || has(v, '$gt') || has(v, '$lte') || has(v, '$gte')
}

function isRange (v) {
  if(!isObject(v)) return false
  if(isString(v.$prefix)) return true
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
  if(isArray(v)) return a.map(lower)
}

function upper (v) {
  if(isBasic(v)) return v
  if(isObject(v)) {
    if(isString(v.$prefix)) return v.$prefix+'\uffff'
    if(has(v, '$gt')) return v.$gt
    if(has(v, '$gte')) return v.$gte
  }
  if(isArray(v)) return a.map(upper)
}

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


module.exports = createFilter







