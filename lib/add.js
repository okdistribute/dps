var path = require('path')
var config = require('../lib/util/config.js')
var download = require('../lib/util/download.js')

module.exports = function (location, args, cb) {
  var id = normalize(location)
  var sources = config.read(args).sources
  if (sources[id]) return cb(new Error('Source exists.'))

  var source = {
    id: id,
    path: id, // TODO: more intelligent paths
    location: location,
    format: args.format,
    type: args.type
  }

  download(source, function (err) {
    if (err) return cb(err)
    config.addSource(source, args)
    cb(null, source)
  })
}

function normalize (source) {
  return source.replace('\/','_').replace(/[^a-z_+A-Z0-9]/ig, '')
}
