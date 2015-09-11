var path = require('path')
var download = require('../lib/download.js')
var sources = require('../lib/sources.js')
var usage = require('../lib/usage.js')('add.txt')

module.exports = {
  name: 'add',
  command: handleAdd,
  options: [
    {
      name: 'type',
      boolean: false,
      default: 'http'
    },
    {
      name: 'format',
      boolean: false
    }
  ]
}

function handleAdd (args) {
  var location = args._[0]
  var name = args._[1] || sources.normalize(args._[0])

  var source = {
    name: name,
    location: location,
    format: args.format,
    type: args.type
  }

  download(source, function (err) {
    if (err) throw err
    success()
  })

  function success () {
    sources.add(source)
  }
}
