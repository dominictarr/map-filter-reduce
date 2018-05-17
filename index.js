var pull = require('pull-stream/pull')
var pullFilter = require('pull-stream/throughs/filter')
var pullFlatten = require('pull-stream/throughs/flatten')
var pullMap = require('pull-stream/throughs/map')
var pullReduce = require('pull-stream/sinks/reduce')

var make = require('./make')
var SinkThrough = require('pull-sink-through')

function first (q) {
  for(var k in q) return k
}

function get (q) {
  var k = first(q)
  var s = k.substring(1)
  if(k[0] == '$' && exports[s]) return exports[s](q)
  throw new Error('unknown function:'+ k)
}

function last (l) {
  return l[l.length - 1]
}

function passSync(fn) {
  return function (data) {
    return data.sync ? data : fn(data)
  }
}

exports = module.exports = function (q, cb) {
  q = q.filter(Boolean)
  if(!q.length) return pull.through()
  if(last(q).$reduce && cb) {
    return pull.apply(null,
      q.slice(0, q.length - 1).map(get)
        .concat(exports.reduce(last(q).$reduce, cb))
    )
  }
  else if(Array.isArray(q))
    return pull.apply(null, q.map(get))
  else
  return get(q)
}

exports.filter = function (q) {
  return pullFilter(passSync(make(q)))
}

exports.map = function (q) {
  return pull(pullMap(passSync(make(q))), pullFilter())
}

exports.reduce = function (q, cb) {
  //TODO: realtime reduce.
  if(cb)
    return pullReduce(make(q), null, cb)
  return pull(SinkThrough(function (cb) {
    return pullReduce(make(q), null, cb)
  }), pullFlatten())
}


