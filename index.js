var path = require('path')
var events = require('events')
var fs = require('fs')
var util = require('util')
var rimraf = require('rimraf')
var parallel = require('run-parallel')
var download = require('./lib/download.js')
var fetch = require('./lib/fetch.js')

var CONFIG_FILE = 'dps.json'

module.exports = DPS

function DPS (dir) {
  if (!(this instanceof DPS)) return new DPS(dir)
  if (!dir) dir = process.cwd()
  this.dir = dir
  this.configPath = path.join(this.dir, CONFIG_FILE)
  this.config = readConfig(this.configPath)
  events.EventEmitter.call(this)
}

util.inherits(DPS, events.EventEmitter)

DPS.prototype.add = function (location, args, cb) {
  var self = this
  if (self.get({location: location})) return cb(new Error('Resource at url', location, 'already added.'))
  if (self.get({name: name})) return cb(new Error('Resource exists with name', name))

  var name = args.name || normalize(location) // should a name be required?

  var resource = {
    path: path.join(self.dir, name), // can we be smarter about paths?
    location: location,
    type: args.type,
    name: name
  }

  return download(resource, function (err) {
    if (err) return cb(err)
    self._add(resource)
    cb(null, resource)
  })
}

DPS.prototype.update = function (opts, cb) {
  var self = this
  if (opts) return self._updateResource(self.get(opts), cb)
  else return self._parallelize(self._updateResource, cb)
}

DPS.prototype._updateResource = function (resource, cb) {
  var self = this
  download(resource, function (err, newResource) {
    if (err) return cb(err)
    var i = self._get_index(resource)
    self.config.resources[i] = newResource
    cb(null, resource)
  })
}

DPS.prototype.checkAll = function (cb) {
  this._parallelize(fetch, cb)
}

DPS.prototype.check = function (opts, cb) {
  fetch(this.get(opts), cb)
}

DPS.prototype.save = function (cb) {
  var self = this
  fs.writeFile(self.configPath, JSON.stringify(self.config, null, 2), cb)
}

DPS.prototype.remove = function (name, cb) {
  var self = this
  if (!name) return cb(new Error('Remove requires a name'))
  var resource = self.get({name: name})
  if (!resource) return cb(new Error('Resource not found with name', name))
  rimraf(resource.path, function (err) {
    self._remove(name)
    cb(err)
  })
}

DPS.prototype._get_index = function (query) {
  var self = this
  for (var i in self.config.resources) {
    var resource = self.config.resources[i]
    for (var key in query) {
      if (resource[key] === query[key]) return i
    }
  }
}

DPS.prototype.get = function (opts) {
  var self = this
  var i = self._get_index(opts)
  return self.config.resources[i]
}

DPS.prototype.destroy = function (cb) {
  var self = this
  self._parallelize(function (resource, done) {
    rimraf(resource.path, done)
  }, function () {
    rimraf(self.configPath, cb)
  })
}

DPS.prototype._parallelize = function (func, cb) {
  var self = this
  var tasks = []
  for (var i in self.config.resources) {
    (function (i) {
      tasks.push(function (done) {
        func(self.config.resources[i], done)
      })
    })(i)
  }
  parallel(tasks, cb)
}

DPS.prototype._remove = function (name) {
  var self = this
  var newResources = []
  for (var i in self.config.resources) {
    var resource = self.config.resources[i]
    if (resource.name !== name) newResources.push(resource)
  }
  self.config.resources = newResources
}

DPS.prototype._add = function (resource) {
  this.config.resources.push(resource)
}

function readConfig (configPath) {
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath))
  return {
    resources: []
  }
}

function normalize (location) {
  return location.replace('\/', '_').replace(/[^a-z_+A-Z0-9]/ig, '')
}
