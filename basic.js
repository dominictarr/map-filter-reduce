
module.exports = {
  $count:
    function (a, b) {
      if(b === undefined) return (a||0)
      return (a||0)+1
    },
  $sum:
    function (a, b) {
      if(b === undefined) return (a||0)
      return (a||0)+(b||0)
    },
  $max:
    function (a, b) {
      if(b === undefined) a
      if(a === undefined) return b
      return Math.max(a, b)
    },
  $min:
    function (a, b) {
      if(b === undefined) a
      if(a === undefined) return b
      return Math.min(a, b)
    },
  $collect:
    function (a, b) {
      if(!a) a = a || []
      if(!Array.isArray(a)) a = [a]
      a.push(b)
      return a
    }
}

