#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
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
  var location = args._[1]
  if (!location || args.help) return usage('dps update [location]')
  return dps.update(location, args, function (err, source) {
    if (err) abort(err)
    done(source)
  })
}

if (cmd === 'destroy') {
  dps.destroy(function (err) {
    if (err) abort(err)
    done('goodbye')
  })
}

function done (message) {
  dps.save(function (err) {
    if (err) abort(err)
    console.log(message)
  })
}

usage(fs.readFileSync('./usage/root.txt').toString())

function abort (err) {
  console.trace(err)
  process.exit(1)
}

function usage (message) {
  console.error(message)
  process.exit(0)
}
