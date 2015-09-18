var update = require('../lib/update.js')
var usage = require('../lib/util/usage.js')('update.txt')

module.exports = {
  name: 'update',
  command: handleUpdate,
  options: []
}

function handleUpdate (args) {
  var name = args._[0]
  update(name, args, function (err) {
    if (err) return console.error(err.message)
    console.error('Update complete.')
  })
}
