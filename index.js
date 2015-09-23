var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var parallel = require('run-parallel')
var download = require('./lib/download.js')
var fetch = require('./lib/fetch.js')

CONFIG_FILE = 'dps.json'

module.exports = function (dir) {
  if (!dir) dir = process.cwd()

  var dps = {}
  var configPath = path.join(dir, CONFIG_FILE)

  dps.config = readConfig(configPath)

  dps.add = function (location, args, cb) {
    if (dps.get(location)) return cb(new Error('Resource exists.'))

    var resource = {
      path: normalize(location),
      location: location,
      type: args.type,
      name: args.name
    }

    download(resource, function (err) {
      if (err) return cb(err)
      addResource(resource)
      cb(null, resource)
    })
  }

  dps.updateAll = function (cb) {
    doParallel(updateOne, cb)
  }

  dps.updateOne = function (location, cb) {
    updateOne(dps.get(location), cb)
  }

  function updateOne (resource, cb) {
    download(resource, function (err, resource) {
      if (err) return cb(err)
      updateResource(resource)
      cb(null, resource)
    })
  }

  dps.checkAll = function (cb) {
    doParallel(fetch, cb)
  }

  dps.check = function (location, cb) {
    fetch(dps.get(location), cb)
  }

  dps.save = function (cb) {
    fs.writeFile(configPath, JSON.stringify(dps.config, null, 2), cb)
  }

  dps.remove = function (key, cb) {
    if (!key) return (cb(new Error('Remove requires a key, got', key)))
    rimraf(dps.get(key).path, function (err) {
      delete dps.get(key)
      cb(err)
    })
  }

  dps.get = function (location) {
    for (var i in dps.config.resources) {
      var resource = dps.config.resources[i]
      if (resource.location === location) {
        return resource
      }
    }
  }

  dps.destroy = function (cb) {
    for (var i in dps.config.resources) {
      var resource = dps.config.resources[i]
      rimraf.sync(dps.get(resource.location).path)
    }
    rimraf.sync(configPath)
    cb()
  }

  function doParallel (func, cb) {
    var tasks = []
    for (var i in dps.config.resources) {
      (function (i) {
        tasks.push(function (done) {
          func(dps.config.resources[i], done)
        })
      })(i)
    }
    parallel(tasks, cb)
  }

  function addResource (resource) {
    dps.config.resources.push(resource)
  }

  function updateResource (newResource) {
    for (var i in dps.config.resources) {
      var resource = dps.config.resources[i]
      if (resource.location === newResource.location) dps.config.resources[i] = newResource
    }
  }

  function readConfig (configPath) {
    if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath))
    else return {
      resources: []
    }
  }

  function normalize (resource) {
    return resource.replace('\/','_').replace(/[^a-z_+A-Z0-9]/ig, '')
  }

  return dps
}
