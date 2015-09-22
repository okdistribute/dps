var got = require('got')
var debug = require('debug')('dps/fetch')
var datPing = require('dat-ping')

module.exports = function (source, cb) {
  // Gets metadata for the source.
  if (source.type === 'url') return fetchUrl(source, cb)
  else return fetchDat(source, cb)
}

function fetchDat (source, cb) {
  datPing(source.location, function (err, status) {
    if (err) return fetchUrl(source, cb)
    source.meta = {
      modified: new Date(status['modified']),
      checked: new Date(),
      size: parseFloat(status.size),
    }
    source.type = 'dat'
    cb(null, source)
  })
}

function fetchUrl (source, cb) {
  var opts =  { method: 'HEAD' }
  got(source.location, opts, function (err, data, res) {
    if (err) return cb(err)
    source.meta = {
      modified: new Date(res.headers['last-modified']),
      size: parseFloat(res.headers['content-length']),
      checked: new Date()
    }
    source.type = 'url'
    cb(null, source)
  })
}
