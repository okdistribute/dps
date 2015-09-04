var fs = require('fs')
var path = require('path')
var GLOBAL = require('./global.js')

var CONFIG_FILE = 'dps.json'


module.exports = {
  read: read,
  update: update
}

function read (opts) {
  if (!opts) opts = {}
  if (opts.global) CONFIG_FILE = path.join(GLOBAL, CONFIG_FILE)
  var exists = fs.existsSync(CONFIG_FILE)
  if (exists) var config = JSON.parse(fs.readFileSync(CONFIG_FILE))
  else {
    var config = {
      sources: {}
    }
    update(config)
  }
  return config
}

function update (config, opts) {
  if (!opts) opts = {}
  fs.writeFile(CONFIG_FILE, JSON.stringify(config))
}
