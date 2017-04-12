var got = require('got')
var debug = require('debug')('dps/fetch')

module.exports = function (resource, cb) {
  // Gets metadata for the resource.
  if (!resource) return cb(new Error('Resource could not be found.'))
  return fetchUrl(resource, cb)
}

function fetchUrl (resource, cb) {
  var opts = { method: 'HEAD' }
  got(resource.location, opts, function (err, data, res) {
    if (err) return cb(err)
    resource.size = res.headers['content-length']
    resource.meta = {
      modified: new Date(res.headers['last-modified']),
      checked: new Date()
    }
    resource.type = 'url'
    cb(null, resource)
  })
}
