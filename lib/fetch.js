var got = require('got')
var debug = require('debug')('dps/fetch')
var datPing = require('dat-ping')

module.exports = function (resource, cb) {
  // Gets metadata for the resource.
  if (resource.type === 'url') return fetchUrl(resource, cb)
  else return fetchDat(resource, cb)
}

function fetchDat (resource, cb) {
  datPing(resource.location, function (err, status) {
    if (err) return fetchUrl(resource, cb)
    resource.name = status.dat.name
    resource.description = status.dat.description
    resource.publisher = status.dat.publisher
    resource.size = parseFloat(status.size)
    resource.meta = {
      modified: new Date(status['modified']),
      checked: new Date()
    }
    resource.type = 'dat'
    debug('its a dat ', resource)
    cb(null, resource)
  })
}

function fetchUrl (resource, cb) {
  var opts = { method: 'HEAD' }
  got(resource.location, opts, function (err, data, res) {
    if (err) return cb(err)
    resource.size = parseFloat(res.headers['content-length'])
    resource.meta = {
      modified: new Date(res.headers['last-modified']),
      checked: new Date()
    }
    resource.type = 'url'
    cb(null, resource)
  })
}
