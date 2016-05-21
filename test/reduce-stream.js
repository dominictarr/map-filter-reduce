var pull = require('pull-stream')
var tape = require('tape')

var mfr = require('../')
var data = [
  {key: 1, value: {author: 'alice', vote: 1}, type: 'okay'},
  {key: 2, value: {author: 'bob', vote: 1}, type: 'okay'},
  {key: 3, value: {author: 'bob', vote: -1}, type: 'okay'},
  {key: 4, value: {author: 'alice', vote: 1}, type: 'okay'}
]

function test(name, query, result) {
  tape(name, function (t) {
    pull(
      pull.values(data),
      mfr.reduce({$reduce: query}),
      pull.collect(function (err, ary) {
        if(err) throw err
        t.deepEqual(ary, result)
        t.end()
      })
    )
  })
}

test('count', {$count: true}, [4])
test('count, value.author', {
    value: {author: ['value', 'author']},
    count: {$count: true}}, [
  {value: {author: 'alice'}, count: 2}, {value: {author: 'bob'}, count: 2}
])

test('count, value.author', {
    author: ['value', 'author'],
    count: {$count: true}}, [
  {author: 'alice', count: 2}, {author: 'bob', count: 2}
])

test('count, value.author', {
    author: ['value', 'author'],
    vote: {$sum: ['value', 'vote']}}, [
  {author: 'alice', vote: 2}, {author: 'bob', vote: 0}
])

test('count, value.author', {
    author: ['value', 'author'], okay: 'type',
    vote: {$sum: ['value', 'vote']}}, [
  {author: 'alice', vote: 2, okay: 'okay'}, {author: 'bob', vote: 0, okay: 'okay'}
])

