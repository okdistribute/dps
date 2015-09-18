var path = require('path')
var download = require('../lib/util/download.js')
var config = require('../lib/util/config.js')
var usage = require('../lib/util/usage.js')('add.txt')

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
  var id = args._[1] || normalize(args._[0])

  var sources = config.read(args).sources

  if (sources[id]) return console.error('Source exists.')

  var source = {
    path: name,
    location: location,
    format: args.format,
    type: args.type
  }

  download(source, function (err) {
    if (err) throw err
    success()
  })

  function success () {
    config.addSource(id, source, args)
  }
}

function normalize (source) {
  return source.replace('\/','_').replace(/[^a-z_+A-Z0-9]/ig, '')
}
