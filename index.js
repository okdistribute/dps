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
  this.configPath = path.join(dir, CONFIG_FILE)
  this.config = readConfig(this.configPath)
  events.EventEmitter.call(this)
}

util.inherits(DPS, events.EventEmitter)

DPS.prototype.add = function (location, args, cb) {
  var self = this
  if (self.get(location)) return cb(new Error('Resource exists.'))

  var resource = {
    path: args.name || normalize(location),
    location: location,
    type: args.type,
    name: args.name
  }

  return download(resource, function (err) {
    if (err) return cb(err)
    self._add(resource)
    cb(null, resource)
  })
}

DPS.prototype.update = function (location, cb) {
  var self = this
  if (location) return self._updateOne(self.get(location), cb)
  else return self._parallelize(self._updateOne, cb)
}

DPS.prototype._updateOne = function (resource, cb) {
  var self = this
  download(resource, function (err, resource) {
    if (err) return cb(err)
    self._updateResource(resource)
    cb(null, resource)
  })
}

DPS.prototype.checkAll = function (cb) {
  this._parallelize(fetch, cb)
}

DPS.prototype.check = function (location, cb) {
  fetch(this.get(location), cb)
}

DPS.prototype.save = function (cb) {
  var self = this
  fs.writeFile(self.configPath, JSON.stringify(self.config, null, 2), cb)
}

DPS.prototype.remove = function (location, cb) {
  var self = this
  if (!location) return cb(new Error('Remove requires a location, got', location))
  var resource = self.get(location)
  if (!resource) return cb(new Error('Resource not found with name', location))
  rimraf(resource.path, function (err) {
    self._remove(location)
    cb(err)
  })
}

DPS.prototype.get = function (location) {
  var self = this
  for (var i in self.config.resources) {
    var resource = self.config.resources[i]
    if (resource.location === location) {
      return resource
    }
  }
}

DPS.prototype.destroy = function (cb) {
  var self = this
  for (var i in self.config.resources) {
    var resource = self.config.resources[i]
    rimraf.sync(resource.path)
  }
  rimraf.sync(self.configPath)
  cb()
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

DPS.prototype._remove = function (location) {
  var self = this
  var newResources = []
  for (var i in self.config.resources) {
    var resource = self.config.resources[i]
    if (resource.location !== location) newResources.push(resource)
  }
  self.config.resources = newResources
}

DPS.prototype._add = function (resource) {
  this.config.resources.push(resource)
}

DPS.prototype._updateResource = function (newResource) {
  var self = this
  for (var i in self.config.resources) {
    var resource = self.config.resources[i]
    if (resource.location === newResource.location) self.config.resources[i] = newResource
  }
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
