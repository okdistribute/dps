var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var pump = require('pump')
var util = require('util')
var extend = require('extend')
var debug = require('debug')('dps')
var got = require('got')
var rimraf = require('rimraf')
var parallel = require('run-parallel')
var fedsearch = require('federated-search')
var fetch = require('./lib/fetch.js')

var CONFIG_FILE = 'dps.json'

module.exports = DPS

function DPS (dir) {
  if (!(this instanceof DPS)) return new DPS(dir)
  this.dir = dir || process.cwd()
  this.configPath = path.join(this.dir, CONFIG_FILE)
  this.config = readConfig(this.configPath)
}

DPS.prototype.downloadLocation = function (resource)  {
  var out = path.join(this.dir, resource.name)
  return path.join(out, path.basename(resource.location))
}

DPS.prototype.download = function (resource, cb) {
  var self = this
  var old = self.get(resource)

  if (old && old.meta &&
    new Date(old.meta.modified) === resource.meta.modified) {
    return cb(null, resource)
  }
  var reader = got.stream(resource.location)
  var out = self.downloadLocation(resource)
  var writer = fs.createWriteStream(out)
  var stream = pump(reader, writer, function (err) {
    if (err) return cb(err)
    addToConfig(self.config, resource)
    self.save(function (err) {
      if (err) return cb(err)
      return cb(null, resource)
    })
  })

}

DPS.prototype.add = function (location, args) {
  // TODO: add a local directory to the tracker..
}


DPS.prototype.update = function (cb) {
  var self = this
  self._parallelize(self.updateResource, cb)
}

DPS.prototype.updateResource = function (resource, cb) {
  this.download(resource, cb)
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
  rimraf(resource.name, function (err) {
    if (err) return cb(err)
    removeFromConfig(self.config, name)
    cb()
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

DPS.prototype._resourcePath = function (resource) {
  return path.join(this.dir, resource.name)
}

DPS.prototype.get = function (opts) {
  var self = this
  var i = self._get_index(opts)
  return self.config.resources[i]
}

DPS.prototype.destroy = function (cb) {
  var self = this
  self._parallelize(function destroyResource (resource, done) {
    rimraf(self._resourcePath(resource), done)
  }, function destroyConfig () {
    rimraf(self.configPath, cb)
  })
}

DPS.prototype._parallelize = function (func, cb) {
  var self = this
  var tasks = []
  for (var i in self.config.resources) {
    (function (i) {
      tasks.push(function (done) {
        func.call(self, self.config.resources[i], done)
      })
    })(i)
  }
  parallel(tasks, cb)
}

function addToConfig (config, resource) {
  config.resources.push(resource)
}

function removeFromConfig (config, name) {
  var newResources = []
  for (var i in config.resources) {
    var resource = config.resources[i]
    if (resource.name !== name) newResources.push(resource)
  }
  config.resources = newResources
}

function readConfig (configPath) {
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath))
  return {
    resources: []
  }
}
