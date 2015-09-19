var got = require('got')
var pump = require('pump')
var debug = require('debug')('dps/download')
var datPing = require('dat-ping')
var formatData = require('format-data')
var execspawn = require('npm-execspawn')
var fs = require('fs')

module.exports = function (source, cb) {
  if (source.type === 'dat') return itsadat(source)
  if (source.type === 'http') return itsaurl(source)
  else { // guess
    datPing(source.location, function (err, status) {
      if (err) return itsaurl(source)
      return itsadat(source)
    })
  }

  function itsaurl (source) {
    debug('downloading', source)
    var reader = got.stream(source.location)
    var writer = fs.createWriteStream(source.path)
    if (source.format) writer = formatData(source.format).pipe(writer)
    pump(reader, writer, function (err) {
      if (err) return cb(err)
      cb(null, source)
    })
  }

  function itsadat (source) {
    // todo: replace with interaction with javascript api
    debug('cloning', source)
    if (fs.existsSync(source.path)) var cmd = 'dat pull ' + source.location + ' --path=' + source.path
    else var cmd = 'dat clone ' + source.location + ' ' + source.path

    console.error('running:\n  ' + cmd)

    var child = execspawn(cmd)
    child.stderr.pipe(process.stderr)
    child.stdout.pipe(process.stdout)
    child.on('exit', function (code) {
      if (code === 0) return cb(null, source)
      else cb(new Error('Error: dat exit code was ' + code))
    })
  }
}
