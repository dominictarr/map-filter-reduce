# map-filter-reduce

A functional query engine, that operates over streams of js objects,
and can be optimized via database indexes.

## example

count the total number of mentions in ssb.

``` js
var mfr = require('map-filter-reduce')
pull(
  ssbc.createLogStream(),
  mfr([
    //get all posts.
    {$filter: { value: { content: { type: 'post' } } }},

    //extract the mentions
    {$map: {mentions: ['value', 'content', 'mentions', 'length']}},

    //sum all the lengths
    {$reduce: {$sum: true}}
  ])
  pull.log()
)
```

This example uses a full scan, so it looks at every object in the
database. for a more efficient way to do the same thing,
see [streamview-links](https://github.com/dominictarr/streamview-links)

## processing streams

`map-filter-reduce` provides three functional stream processing
operators. usually, generally, filter should be used first,
then map then reduce, but operators can be combined in any order,
and used any number of times.

### filter

a filter removes items from an incoming stream.

#### basic values: strings, numbers, booleans

strings, numbers and booleans match exactly.

``` js
{$filter: 'okay'}
```
matches all strings that equal `"okay"`

#### $prefix

`$prefix` operator matches strings that start with a given string.
``` js
{$filter: {$prefix: 'o'}}
```
this will match `"okay"` `"ok"` `"oh no"`, etc.

#### $gt, $lt, $gte, $lte

match values that are greater than, less than, greater than or equal, or less than or equal.
A greater operator and a lesser operator may be combined into one comparison.

``` js
{$filter: {$gte: 0, $lt: 1}}
```
will filter numbers from 0 up to but not including 1.

#### objects

an object is used to filter objects that have the same properties.
an object is combined with other operators that apply to the keys.

``` js
{$filter: {name: {$prefix: 'bob'}, age: {$gt: 10}}}
```
select "bob", "bobby", and "bobalobadingdog", if their age is greater than 10.

#### arrays

arrays are used treated somewhat like strings, in that you can also
use the `$prefix` and `$gt, $lt, $gte, $lte` operators.


arrays are like objects, but their keys are compared in order from left to right.

{$filter: {$prefix: ['okay']}}

### map

If the incoming stream has fields you are not interested in,
or fields that you'd like to remap, you can _map_ those objects.

lets say, we have a nested object incoming, but we just want to pluck off
the a nested name field.

``` js
{$map: {name: ['value', 'name']}}
```

if the input was `{key: k, value: {foo: blah, name: 'bob'}}`
the output would just be `{name: 'bob'}`.

#### key: strings, numbers

strings and numbers are used to get keys off the input.

``` js
{$map: 'value'}
```
would return the value property of the input, and drop the rest.
use numbers (integers) if the input will be an array.

#### keys: objects

for a {} object, each value is considered a rule, and applied to
the value of the incoming data. a value with the transformations applied
will be returned.

the keys in the object do not need to be the same as in the input,
since the values will map to which keys to operate on from the input.

``` js
{$map: {foo: 'bar', bar: 'foo'}}
```
transform the input stream into a stream with `foo` and `bar` keys switched,
and any other keys dropped.

#### path: arrays

arrays are used to lookup deep into an object. they are analogous to useing
chaining dots in javascript.

``` js
{$map: ['value', 'name']}
```
get the value property, and then get the name property off that.

#### wildcard

to get _everything_ use `true`

``` js
{$map: true}
```
say, we have an object with _many_ keys, and we want to reduce that to just
`timestamp` and then put everything under `value`

``` js
{$map: {timestamp: 'timestamp', value: true}}
```

### reduce

reduce is used to aggregate many values into a representative value.
`count`, `sum`, `min`, `max`, are all reduces.

#### count

count how many items are in the input
``` js
{$reduce: {$count: true}}
```

#### sum

sum elements in the input. input elements must be numbers.
sums can be applied to paths, or strings to get the values to sum.

add up all the values for `value.age`
``` js
{$reduce: {$sum: ['value', 'age']}}
```

#### min, max

get the minimum or maximum for a value.

``` js
{$reduce: {$min: ['value', 'age']}}
```

#### collect

get all values an put them into an array.

get all values for `foo`
``` js
{$reduce: {$collect: 'foo'}}
```
this may produce a large value if there are many items in the input stream.

#### objects

to apply multiple reduce functions, put them in an object with
key names.

``` js
{$reduce: {
  youngest: {$min: ['value','age']},
  oldest: {$max: ['value', 'age']}
}}
```
#### groups

To group, use the other reduce functions
along side path expressions, as used under `$map`

In the following query,
``` js
{$reduce: {
  country: 'country',
  population: {$count: true}
}}
```
count items per country. Will give a stream of items each with
a `{country, population}` fields.

This would return a object, with the shape `{<country>:{<city>: <population>}}`.

Note that, like in `$map` arrays can be used to drill deep into
an object.
``` js
{$reduce: {name: ['value', 'name'], posts: {$count: true}}}
```

TODO: group by time ranges (day, month, week, year, etc)

## License

MIT





