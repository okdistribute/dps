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
    if (getSource(location)) return cb(new Error('Source exists.'))

    var source = {
      path: normalize(location),
      location: location,
      type: args.type
    }

    download(source, function (err) {
      if (err) return cb(err)
      updateSource(source)
      cb(null, source)
    })
  }

  dps.updateAll = function (cb) {
    var tasks = []
    for (var key in dps.config.sources) {
      if (dps.config.sources.hasOwnProperty(key)) {
        tasks.push(function (done) {
          updateOne(sourceList[key], done)
        })
      }
    }
    parallel(tasks, cb)
  }

  dps.updateOne = function (source, cb) {
    download(source, function (err, source) {
      if (err) return cb(err)
      updateSource(source)
      cb(null, source)
    })
  }

  dps.fetchAll = function (cb) {
    var tasks = []
    for (var key in dps.config.sources) {
      if (dps.config.sources.hasOwnProperty(key)) {
        tasks.push(function (done) {
          fetch(dps.config.sources[key], done)
        })
      }
    }
    parallel(tasks, cb)
  }

  dps.fetch = function (location, cb) {
    fetch(getSource(location), cb)
  }

  dps.save = function (cb) {
    fs.writeFile(configPath, JSON.stringify(dps.config, null, 2), cb)
  }

  dps.destroy = function (cb) {
    for (var key in dps.config.sources) {
      if (dps.config.sources.hasOwnProperty(key)) {
        rimraf.sync(dps.config.sources[key].path)
      }
    }
    rimraf.sync(configPath)
    cb()
  }

  function getSource (location) {
    return dps.config.sources[location]
  }

  function updateSource (source) {
    dps.config.sources[source.location] = source
  }

  function readConfig (configPath) {
    if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath))
    else return { sources: {} }
  }

  function normalize (source) {
    return source.replace('\/','_').replace(/[^a-z_+A-Z0-9]/ig, '')
  }

  return dps
}
