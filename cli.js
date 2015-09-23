#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var path = require('path')
var relativeDate = require('relative-date')
var prettyBytes = require('pretty-bytes')

var dps = require('./')(args.path)

var cmd = args._[0]

return exec(cmd)

function exec (cmd) {
  if (cmd === 'add') {
    var location = args._[1]
    if (!location || args.help) return usage('dps add <location>')

    return dps.add(location, args, function (err, resource) {
      if (err) abort(err)
      done(resource)
    })
  }

  if (cmd === 'rm' || cmd === 'remove') {
    var location = args._[1]
    if (!location|| args.help) return usage('dps rm <resource>')
    return dps.remove(location, function (err, data) {
      if (err) abort(err)
      done('Successfully deleted.')
    })
  }


  if (cmd === 'update') {
    if (args.help) return usage('dps update [location]')
    var cb = function (err, data) {
      if (err) abort(err)
      done(data)
    }
    var location = args._[1]
    if (location) return dps.updateOne(location, cb)
    return dps.updateAll(cb)
  }

  if (cmd === 'destroy') {
    return dps.destroy(function (err) {
      if (err) abort(err)
      console.log('goodbye')
    })
  }

  if (cmd === 'check') {
    if (args.help) return usage('dps fetch [location]')
    var location = args._[1]
    var cb = function (err, data) {
      if (err) abort(err)
      return exec('status')
    }
    if (location) return dps.check(location, cb)
    else return dps.checkAll(cb)
  }

  if (cmd === 'status' || cmd === 'st') {
    var output = ''
    for (var key in dps.config.resources) {
      if (dps.config.resources.hasOwnProperty(key)) {
        var resource = dps.config.resources[key]
        output += '\n'
        output += resource.location + '\n'
        output += '  checked: ' + relativeDate(new Date(resource.meta.checked))
        output += '  modified: ' + relativeDate(new Date(resource.meta.modified))
        output += '  size: ' + prettyBytes(resource.size)
        output += '\n'
      }
    }

    return console.log(output)
  }

  usage(fs.readFileSync(path.join(__dirname, '/usage/root.txt')).toString())
}

function done (message) {
  dps.save(function (err) {
    if (err) abort(err)
    console.log(message)
  })
}

function abort (err) {
  console.trace(err)
  process.exit(1)
}

function usage (message) {
  console.error(message)
  process.exit(0)
}
