var fs = require('fs')
var got = require('got')
var mkdirp = require('mkdirp')
var path = require('path')
var pump = require('pump')
var util = require('util')
var extend = require('extend')
var debug = require('debug')('dps/download')
var fetch = require('./fetch')

module.exports = Downloader

function Downloader (dir, resource, cb) {
  if (!(this instanceof Downloader)) return new Downloader(dir, resource, cb)
  var self = this
  var old = extend({}, resource)

  fetch(resource, function (err, resource) {
    if (err) return cb(err)
    // gets the full data only if its new.

    if (old.meta && new Date(old.meta.modified).toString() === resource.meta.modified.toString()) {
      return cb(null, resource)
    }

    if (resource.type === 'dat') return itsadat(resource)
    else if (resource.type === 'url') return itsaurl(resource)
    else return cb(new Error('Resource type not supported.'))
  })

  function itsaurl (resource) {
    debug('downloading', resource)
    var reader = got.stream(resource.location)
    var out = path.join(dir, resource.name)
    mkdirp(out)
    var writer = fs.createWriteStream(path.join(out, resource.name))
    var stream = pump(reader, writer, function (err) {
      if (err) return cb(err)
      cb(null, resource)
    })
  }

  function itsadat (resource) {
    // TODO: replace with interaction with javascript api
    debug('cloning', resource)
    var cmd
    var dest = path.join(dir, resource.name)
    cb(new Error('dat not supported'))
  }
}
