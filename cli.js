#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var path = require('path')
var relativeDate = require('relative-date')
var prettyBytes = require('pretty-bytes')
var dps = require('./')(args.path)

var cmd = args._[0]

if (cmd === 'add') {
  var location = args._[1]
  if (!location || args.help) return usage('dps add <location>')
  return dps.add(location, args, function (err, source) {
    if (err) abort(err)
    done(source)
  })
}

if (cmd === 'update') {
  if (args.help) return usage('dps update [location]')
  var cb = function (err, data) {
    if (err) abort(err)
    done(data)
  }
  var location = args._[1]
  if (location) return dps.update(location, cb)
  return dps.updateAll(cb)
}

if (cmd === 'destroy') {
  return dps.destroy(function (err) {
    if (err) abort(err)
    console.log('goodbye')
  })
}

if (cmd === 'fetch') {
  if (args.help) return usage('dps fetch [location]')
  var location = args._[1]
  var cb = function (err, data) {
    if (err) abort(err)
    done(data)
  }
  if (location) return dps.fetch(location, cb)
  else return dps.fetchAll(cb)
}

if (cmd === 'status') {
  var output = ''
  for (var key in dps.config.sources) {
    if (dps.config.sources.hasOwnProperty(key)) {
      var source = dps.config.sources[key]
      output += '\n'
      output += source.location + '\n'
      output += '  checked: ' + relativeDate(new Date(source.meta.checked))
      output += '  modified: ' + relativeDate(new Date(source.meta.modified))
      output += '  size: ' + prettyBytes(source.meta.size)
      output += '\n'
    }
  }

  return console.log(output)
}

function done (message) {
  dps.save(function (err) {
    if (err) abort(err)
    console.log(message)
  })
}

usage(fs.readFileSync(path.join(__dirname, '/usage/root.txt')).toString())

function abort (err) {
  console.trace(err)
  process.exit(1)
}

function usage (message) {
  console.error(message)
  process.exit(0)
}
