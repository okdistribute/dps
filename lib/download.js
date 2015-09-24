var fs = require('fs')
var got = require('got')
var path = require('path')
var pump = require('pump')
var extend = require('extend')
var debug = require('debug')('dps/download')
var formatData = require('format-data')
var execspawn = require('npm-execspawn')
var fetch = require('./fetch')

module.exports = function download (dir, resource, cb) {
  var old = extend({}, resource)
  return fetch(resource, function (err, resource) {
    if (err) return cb(err)
    // gets the full data only if its new.

    // this is some janky date equality junk happening right here
    if (old.meta &&
        (new Date(old.meta.modified).toString() === resource.meta.modified.toString() &&
        old.meta.size === resource.meta.size)) return cb(null, resource)

    if (resource.type === 'dat') return itsadat(resource)
    if (resource.type === 'url') return itsaurl(resource)
  })

  function itsaurl (resource) {
    debug('downloading', resource)
    var reader = got.stream(resource.location)
    var writer = fs.createWriteStream(path.join(dir, resource.name))
    if (resource.format) writer = formatData(resource.format).pipe(writer)
    return pump(reader, writer, function (err) {
      if (err) return cb(err)
      resource.type = 'url'
      cb(null, resource)
    })
  }

  function itsadat (resource) {
    // todo: replace with interaction with javascript api
    debug('cloning', resource)
    var cmd
    if (fs.existsSync(resource.name)) cmd = 'dat pull ' + resource.location + ' --path=' + path.join(dir, resource.name)
    else cmd = 'dat clone ' + resource.location + ' ' + resource.name
    console.error('running:\n  ' + cmd)
    var child = execspawn(cmd)
    child.on('exit', function (code) {
      if (code === 0) {
        resource.type = 'dat'
        return cb(null, resource)
      }
      return cb(new Error('Error: dat exit code was ' + code))
    })
    return child
  }
}
