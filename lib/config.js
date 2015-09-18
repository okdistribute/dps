var fs = require('fs')
var path = require('path')

var CONFIG_FILE = 'dps.json'

module.exports = {
  addSource:  addSource,
  normalize: normalize,
  read: read,
  update: update
}

function addSource (source, args) {
  var cur = read(args)
  if (cur.sources[source.name]) console.log('Source updated.')
  else console.log('Source added.')
  cur.sources[source.name] = source
  update(cur)
}

function normalize (source) {
  return source.replace('\/','_').replace(/[^a-z_+A-Z0-9]/ig, '')
}

function read (args) {
  if (!args) args = {}
  var configPath = getConfigPath(args)
  var config

  if (fs.existsSync(configPath)) {
    try {
       config = JSON.parse(fs.readFileSync(configPath))
    } catch (err) {
      console.error('Your package.json file is malformed.')
    }
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
