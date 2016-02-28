var tape = require('tape')
var filter = require('../filter')
var input = [
  {
    "rel": [
      "vote",
      1
    ],
    "dest": "%dqEyLcxlGPOL21uRH6mVxOCSjdl3tOmmF0HkdzI2nqs=.sha256",
    "source": "@p13zSAiOpguI9nsawkGijsnMfWmFd5rlUNpzekEE+vI=.ed25519",
    "ts": 1449201687478.029
  },
  {
    "rel": [
      "vote",
      1
    ],
    "dest": "%dqEyLcxlGPOL21uRH6mVxOCSjdl3tOmmF0HkdzI2nqs=.sha256",
    "source": "@vt8uK0++cpFioCCBeB3p3jdx4RIdQYJOL/imN1Hv0Wk=.ed25519",
    "ts": 1449201705535.0264
  }
]

tape('foo', function (t) {
  t.deepEqual(
    input.filter(filter({rel: ['vote', 1]})),
    input
  )
  t.end()
})
