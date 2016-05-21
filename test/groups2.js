
//tape('more groups, object', function (t) {
//  t.deepEqual(groups.reduce(R({
//      $group: ['country', 'dwelling'],
//      $reduce: {$collect: 'name'}
//    }), null),
//    {
//      US: {
//        apartment: ['pfraze', 'du5t'],
//        house: ['substack']
//      },
//      NZ: {
//        house: ['mix'],
//        sailboat: ['dominic']
//      }
//    }
//  )
//  t.end()
//})
//


//tape('nested array groups', function (t) {
//
//  t.deepEqual(
//    groups.reduce(R({
//      dwelling: 'dwelling',
//      citizens: {$group: 'country', $reduce:  {
//        $count: true
//      }}
//    }), null),
//    [
//      {dwelling: 'apartment', citizens: {US: 2}},
//      {dwelling: 'house', citizens: {NZ: 1, US: 1}},
//      {dwelling: 'sailboat', citizens: {NZ: 1}}
//    ]
//  )
//  t.end()
//})

tape('nested object groups', function (t) {
  t.deepEqual(
    groups.reduce(R({
      $group: 'country',
      $reduce: {
        population: {$count: true},
        housing: {$group: 'dwelling', $reduce: { $count: true }}
      }
    }), null),
    { US: { population: 3, housing: { apartment: 2, house: 1 } },
      NZ: { population: 2, housing: { house: 1, sailboat: 1 } } }
  )
  t.end()
})


