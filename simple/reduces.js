
exports.count = function (a, b) {
  return (a||0)+1
}
exports.sum = function (a, b) {
  return (+a||0)+(+b||0)
}
exports.product = function (a, b) {
  return (a||1)*(b||1)
}
exports.max = function (a, b) {
  if(b === undefined) a
  if(a === undefined) return b
  return Math.max(a, b)
}
exports.min = function (a, b) {
  if(b === undefined) a
  if(a === undefined) return b
  return Math.min(a, b)
}
exports.collect = function (a, b) {
  if(!a) a = a || []
  if(!Array.isArray(a)) a = [a]
  a.push(b)
  return a
}




