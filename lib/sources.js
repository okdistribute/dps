var fs = require('fs')
var path = require('path')

var CONFIG_FILE = 'dps.json'

module.exports = {
  add: add,
  normalize: normalize,
  read: read,
  update: update
}

function add (source, opts) {
  var cur = read(opts)
  if (cur.sources[source.name]) console.log('Source updated.')
  else console.log('Source added.')
  cur.sources[source.name] = source
  update(cur)
}

function normalize (source) {
  return source.replace('\/','_').replace(/[^a-z_+.A-Z0-9]/ig, '')
}

function read (opts) {
  if (!opts) opts = {}
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
  fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}
