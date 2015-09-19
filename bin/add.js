var addSource = require('../lib/add.js')
var usage = require('../lib/util/usage.js')('add.txt')

module.exports = {
  name: 'add',
  command: handleAdd,
  options: [
    {
      name: 'type',
      boolean: false
    },
    {
      name: 'format',
      boolean: false
    }
  ]
}

function handleAdd (args) {
  var location = args._[0]
  addSource(location, args, function (err) {
    if (err) return console.error(err.message)
    console.error('Source added successfully.')
  })
}
