var u = require('./util')

module.exports = function map (q, v) {
  if(v === undefined) return v
  if(true === q) return v
  if(v === null) return undefined
  if(u.isString(q) || u.isNumber(q)) return v[q]
  if(u.isArray(q))
    return q.length > 1 ? map(q.slice(1), v[q[0]]) : map(q[0], v)
  if(u.isObject(q)) {
    var o = {}, match = false
    for(var k in q) {
      var _v = q[k] === true ? v[k] : map(q[k], v)
      if(_v !== undefined) {
        o[k] = _v; match = true
      }
    }
    return match ? o : undefined
  }
}









