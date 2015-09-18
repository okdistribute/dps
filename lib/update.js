var config = require('../lib/util/config.js')
var download = require('../lib/util/download.js')

module.exports = function (name, args, cb) {
  var sourceList = config.read(args).sources
  if (name) return download(sourceList[name], cb)
  for (var name in sourceList) {
    download(sourceList[name], cb)
  }
}
