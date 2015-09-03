#!/usr/bin/env node
var subcommand = require('subcommand')

var config = {
  root: require('./bin/root.js'),
  commands: [
    require('./bin/add.js')
  ],
  defaults: require('./bin/defaults.js'),
  none: noMatch
}

var route = subcommand(config)
route(process.argv.slice(2))

function noMatch (args) {
  console.error('dps:', args._[0], 'is not a valid command')
  process.exit(1)
}
