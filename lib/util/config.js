var fs = require('fs')
var path = require('path')

var CONFIG_FILE = 'dps.json'

module.exports = {
  addSource:  addSource,
  destroy: destroy,
  read: read,
  update: update
}

function addSource (id, source, args) {
  var cur = read(args)
  source.last_updated = new Date()
  cur.sources[id] = source
  update(cur)
}

function read (args) {
  if (!args) args = {}
  var configPath = getConfigPath(args)
  var config

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath))
  } else {
    config = {
      sources: {}
    }
    update(config)
  }
  return config
}

function update (config, args) {
  if (!args) args = {}
  fs.writeFile(getConfigPath(args), JSON.stringify(config, null, 2))
}

function getConfigPath (args) {
  if (args.path) dir = args.path
  else dir = process.cwd()
  return path.join(dir, CONFIG_FILE)
}

function destroy (args) {
  var configPath = getConfigPath(args)
  rimraf(configPath)
}
