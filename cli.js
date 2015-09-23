#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var path = require('path')
var relativeDate = require('relative-date')
var prettyBytes = require('pretty-bytes')

var dps = require('./')(args.path)
exec(args._[0])

function exec (cmd) {
  if (cmd === 'add') {
    var location = args._[1]
    if (!location || args.help) return usage('dps add <location> [name]')
    args.name = args.name || args.n || args._[2]
    var stream = dps.add(location, args, function (err, resource) {
      if (err) abort(err)
      done(resource)
    })
    if (stream && stream.stdout) {
      console.log('got stream')
      stream.stdout.pipe(process.stdout)
      stream.stderr.pipe(process.stderr)
    }
    return stream
  }

  if (cmd === 'rm' || cmd === 'remove') {
    var name = args._[1]
    if (!name || args.help) return usage('dps rm <name>')
    return dps.remove(name, function (err, data) {
      if (err) abort(err)
      done('Successfully deleted.')
    })
  }

  if (cmd === 'update') {
    if (args.help) return usage('dps update [name]')
    var cb = function (err, data) {
      if (err) abort(err)
      done(data)
    }
    name = args._[1]
    if (name) return dps.updateOne(name, cb)
    return dps.updateAll(cb)
  }

  if (cmd === 'destroy') {
    return dps.destroy(function (err) {
      if (err) abort(err)
      console.log('goodbye')
    })
  }

  if (cmd === 'check') {
    if (args.help) return usage('dps fetch [name]')
    name = args._[1]
    cb = function (err, data) {
      if (err) abort(err)
      return exec('status')
    }
    if (name) return dps.check(name, cb)
    else return dps.checkAll(cb)
  }

  if (cmd === 'status' || cmd === 'st') {
    var output = ''
    for (var key in dps.config.resources) {
      if (dps.config.resources.hasOwnProperty(key)) {
        var resource = dps.config.resources[key]
        output += '\n'
        output += resource.name + '\n'
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
