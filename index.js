var path = require('path')
var parallel = require('run-parallel')
var download = require('../lib/util/download.js')

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

  dps.updateAll = function (args, cb) {
    var tasks = []
    for (var key in dps.config.sources) {
      tasks.push(function (done) {
        updateOne(sourceList[key], args, done)
      })
    }
    parallel(tasks, cb)
  }

  dps.updateOne = function (source, args, cb) {
    download(source, function (err, source) {
      if (err) return cb(err)
      updateSource(source, args)
      cb(null, source)
    })
  }

  dps.save = function (cb) {
    fs.writeFile(configPath, JSON.stringify(config, null, 2), cb)
  }

  dps.destroy = function () {
    for (var source in config.sources) {
      rimraf.sync(source.path)
    }
    rimraf.sync(configPath)
  }

  function getSource (location) {
    return config.sources[location]
  }

  function updateSource (source) {
    source.last_updated = new Date()
    config.sources[source.location] = source
  }


  return dps
}


function readConfig (configPath) {
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath))
  else return { sources: {} }
}

module.exports = function normalize (source) {
  return source.replace('\/','_').replace(/[^a-z_+A-Z0-9]/ig, '')
}
