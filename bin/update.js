var config = require('../lib/config.js')
var usage = require('../lib/usage.js')('update.txt')
var download = require('../lib/download.js')

module.exports = {
  name: 'update',
  command: handleUpdate,
  options: []
}

function handleUpdate (args) {
  var name = args._[0]
  var sourceList = config.read(args).sources

  if (name) return updateOne(sourceList[name])

  for (var name in sourceList) {
    updateOne(sourceList[name])
  }
}

function updateOne (source) {
  download(source, function (err) {
    if (err) throw err
    console.log('Updated successfully.')
  })
}
