var fs = require('fs')
var got = require('got')
var path = require('path')
var pump = require('pump')
var util = require('util')
var extend = require('extend')
var events = require('events')
var debug = require('debug')('dps/download')
var execspawn = require('npm-execspawn')
var fetch = require('./fetch')

module.exports = Downloader

function Downloader (dir, resource) {
  if (!(this instanceof Downloader)) return new Downloader(dir, resource)
  var self = this
  var old = extend({}, resource)
  self.finished = false

  events.EventEmitter.call(this)

  fetch(resource, function (err, resource) {
    if (err) return self.emit('error', err)
    // gets the full data only if its new.
    self.emit('resource', resource)

    // TODO: this is some janky date equality junk happening right here
    if (old.meta &&
    (new Date(old.meta.modified).toString() === resource.meta.modified.toString() &&
    old.meta.size === resource.meta.size)) {
      self.emit('resource', resource)
      return done(resource)
    }

    if (resource.type === 'dat') return itsadat(resource)
    else if (resource.type === 'url') return itsaurl(resource)
    else return self.emit('error', new Error('Resource type not supported.'))
  })

  function done (resource) {
    self.emit('done', resource)
    self.finished = true
  }

  function itsaurl (resource) {
    debug('downloading', resource)
    var reader = got.stream(resource.location)
    var writer = fs.createWriteStream(path.join(dir, resource.name))
    var stream = pump(reader, writer, function (err) {
      if (err) return self.emit('error', err)
      done(resource)
    })
    self.emit('child', stream)
  }

  function itsadat (resource) {
    // TODO: replace with interaction with javascript api
    debug('cloning', resource)
    var cmd
    var dest = path.join(dir, resource.name)
    if (fs.existsSync(dest)) cmd = 'dat pull ' + resource.location + ' --path=' + dest
    else cmd = 'dat clone ' + resource.location + ' ' + dest
    console.error('running:\n  ' + cmd)
    var child = execspawn(cmd)
    child.on('exit', function (code) {
      if (code !== 0) return self.emit('error', new Error('Error: dat exit code was ' + code))
      done(resource)
    })
    self.emit('child', child)
  }
}

util.inherits(Downloader, events.EventEmitter)
