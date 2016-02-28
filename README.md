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
{$prefix: 'o'}
```
this will match `"okay"` `"ok"` `"oh no"`, etc.

#### $gt, $lt, $gte, $lte

match values that are greater than, less than, greater than or equal, or less than or equal.
A greater operator and a lesser operator may be combined into one comparison.

``` js
{$gte: 0, $lt: 1}
```
will filter numbers from 0 up to but not including 1.

#### objects

an object is used to filter objects that have the same properties.
an object is combined with other operators that apply to the keys.

``` js
{name: {$prefix: 'bob'}, age: {$gt: 10}}
```
select "bob", "bobby", and "bobalobadingdog", if their age is greater than 10.

#### arrays

arrays are like objects, but their keys are compared in order from left to right.

TODO: implement prefix and ltgt ranges on arrays.

### map

If the incoming stream has fields you are not interested in,
or fields that you'd like to remap, you can _map_ those objects.

lets say, we have a nested object incoming, but we just want to pluck off
the a nested name field.

``` js
{name: ['value', 'name']}
```

#### key: strings, numbers

strings and numbers are used to get keys off the input.

``` js
'value'
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
{foo: 'bar', bar: 'foo'}
```
transform the input stream into a stream with `foo` and `bar` keys switched,
and any other keys dropped.

#### path: arrays

arrays are used to lookup deep into an object. they are analogous to useing
chaining dots in javascript.

``` js
['value', 'name']
```
get the value property, and then get the name property off that.

### reduce

reduce is used to aggregate many values into a representative value.
`count`, `sum`, `min`, `max`, and `group` are all reduces.

#### count

count how many items are in the input
``` js
{$count: true}
```

#### sum

sum elements in the input. input elements must be numbers.
sums can be applied to paths, or strings to get the values to sum.

add up all the values for `value.age`
``` js
{$sum: ['value', 'age']}
```

#### min, max

get the minimum or maximum for a value.

``` js
{$min: ['value', 'age']}
```

#### collect

get all values an put them into an array.

get all values for `foo`
``` js
{$collect: 'foo'}
```
this may produce a large value if there are many items in the input stream.

#### objects

to apply multiple reduce functions, put them in an object with
key names.

``` js
{
  youngest: {$min: ['value','age']},
  oldest: {$max: ['value', 'age']}
}
```
#### group

group the input into sections. group is used with other reducers,
first group splits the input into groups, and then runs the reducers
on the elements in that group.

``` js
{
  $group: 'country',
  $count: true
}
```
count items per country. will give a single output, that is an object
where each value for `country` in the input becomes a key.

say, if the inputs values for country where `nz, us, de, au` then the
output might be:

``` js
{
  nz: 2,
  us: 4,
  de: 2,
  au: 1
}
```
group can be applied to more than one field by using an array.

``` js
{$group: ['country', 'city'], $count: true}
```

would return an object nested to two levels, by country, then city

Note that in group, arrays are used for a list of groups,
instead of paths, to get a path, use an array inside an array!

``` js
{$group: [['value', 'name']], $count: true}
```

since groups are also just reduces, they can be nested by using
object keys. this lets us apply aggregation on different levels.

``` js
{$group: 'country',
  count: {$count: true},
  city: {
    $group: [['country', 'city']],
    $count: true
  }
}
```

the output might look like this:

``` js
{
  nz: {
    count: 2,
    city: {akl: 1, wlg: 1},
  },
  us: {
    count: 4,
    city: {nyc: 1, aus: 1, sfo: 1, pdx: 1}
  },
  de:  {
    count: 2, city: {ber: 2}
  },
  au: {
    count: 1, city: {syd: 1}
  }
}
```

TODO: group by time ranges (day, month, week, year, etc)

## License

MIT






