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

  events.EventEmitter.call(this)

  fetch(resource, function (err, resource) {
    if (err) return self.emit('done', err)
    // gets the full data only if its new.
    self.emit('resource', resource)

    // TODO: this is some janky date equality junk happening right here
    if (old.meta &&
    (new Date(old.meta.modified).toString() === resource.meta.modified.toString() &&
    old.meta.size === resource.meta.size)) {
      self.emit('done', null, resource)
      self.emit('resource', resource)
      return
    }

    if (resource.type === 'dat') return itsadat(resource)
    else if (resource.type === 'url') return itsaurl(resource)
    else return self.emit('done', new Error('Resource type not supported.'))
  })

  function itsaurl (resource) {
    debug('downloading', resource)
    var reader = got.stream(resource.location)
    var writer = fs.createWriteStream(path.join(dir, resource.name))
    var stream = pump(reader, writer, function (err) {
      if (err) return self.emit('done', err)
      self.emit('done', null, resource)
    })
    self.emit('child', stream)
  }

  function itsadat (resource) {
    // TODO: replace with interaction with javascript api
    debug('cloning', resource)
    var cmd
    if (fs.existsSync(resource.name)) cmd = 'dat pull ' + resource.location + ' --path=' + path.join(dir, resource.name)
    else cmd = 'dat clone ' + resource.location + ' ' + resource.name
    console.error('running:\n  ' + cmd)
    var child = execspawn(cmd)
    child.on('exit', function (code) {
      if (code !== 0) return self.emit('done', new Error('Error: dat exit code was ' + code))
      self.emit('done', null, resource)
    })
    self.emit('child', child)
  }
}

util.inherits(Downloader, events.EventEmitter)
