var config = require('../lib/util/config.js')
var download = require('../lib/util/download.js')
var parallel = require('run-parallel')

module.exports = function (name, args, cb) {
  var sourceList = config.read(args).sources
  if (name) return updateOne(sourceList[name], args, cb)
  var tasks = []
  for (var key in sourceList) {
    tasks.push(function (done) {
      updateOne(sourceList[key], args, done)
    })
  }
  parallel(tasks, cb)
}

function updateOne (source, args, cb) {
  download(source, function (err, source) {
    if (err) return cb(err)
    config.addSource(source, args)
    cb(null, source)
  })
}
