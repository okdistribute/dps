var usage = require('../lib/usage.js')('install.txt')
var clone = require('dat/lib/clone.js')
var path = require('path')

module.exports = {
  name: 'add',
  command: handleAdd,
  options: [
    {
      name: 'username',
      boolean: false,
      abbr: 'u'
    },
    {
      name: 'password',
      boolean: false,
      abbr: 'p'
    }
  ]
}

function handleAdd (args) {
  var PREFIX = process.env.DATA_PACKAGES || '.'
  var name = args._[0]
  var target = path.join(PREFIX, name)
  clone(name, target, args, function (err, db) {

  })
}