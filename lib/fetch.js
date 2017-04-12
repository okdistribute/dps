var got = require('got')
var debug = require('debug')('dps')

module.exports = function (location, args, cb) {
  // Gets metadata for the resource.
  if (!location) return cb(new Error('Resource could not be found.'))
  var name = args.name || normalize(location)
  var resource = {
    location: location,
    type: args.type,
    name: name
  }
  return fetchUrl(resource, cb)
}

function fetchUrl (resource, cb) {
  var opts = { method: 'HEAD' }
  got(resource.location, opts, function (err, data, res) {
    if (err) return cb(err)
    resource.size = res.headers['content-length']
    if (resource.size) resource.size = parseInt(resource.size)
    resource.meta = {
      modified: new Date(res.headers['last-modified']),
      checked: new Date()
    }
    resource.type = 'url'
    cb(null, resource)
  })
}

function normalize (location) {
  return location.replace('\/', '_').replace(/[^a-z_+A-Z0-9]/ig, '')
}
