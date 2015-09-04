var path = require('path')
var got = require('got')
var datPing = require('dat-ping')
var ProgressBar = require('progress');
var url = require('url')
var execspawn = require('npm-execspawn')

var GLOBAL = require('./global.js')
var sources = require('../lib/sources.js')
var usage = require('../lib/usage.js')('add.txt')

module.exports = {
  name: 'add',
  command: handleAdd,
  options: [
    {
      name: 'global',
      abbr: 'g',
      boolean: true,
      default: false
    }
  ]
}

function handleAdd (args) {
  var location = args._[0]
  var name = args._[1] || getName(args._[0])
  if (args.global) name = path.join(GLOBAL, name)

  var source = {
    name: name,
    location: location
  }

  if (url.parse(location).protocol === 'http') return url()
  else datPing(location, ondat)

  function success () {
    sources.add(source)
  }

  function url () {
    got(location, function (err, data) {
      if (err) throw err
      if (data.dat) return ondat(null, data.status)
      source.type = 'url'
      success()
    })
  }

  function ondat (err, status) {
    var cmd = 'dat clone ' + location + ' ' + name
    console.error('Detected a dat, running:\n  ' + cmd)
    source.type = 'dat'

    var child = execspawn('cmd')
    child.stderr.pipe(process.stderr)
    child.stdout.pipe(process.stdout)
    child.on('exit', function (code) {
      if (code === 0) return success()
    })
  }

}

function getName (source) {
  return source
    .replace(/\.dat$/i, '').replace(/[^\-._a-z0-9]+$/i, '')
    .split(/[^\-._a-z0-9]/i).pop() || 'dat-' + Date.now()
}

