var test = require('tape')
var tmp = require('os').tmpdir()
var fs = require('fs')
var path = require('path')
var dps = require('..')(tmp)

var location = 'http://localhost:6442'

test('add/get/destroy', function (t) {
  dps.destroy(function (err) {
    t.ifError(err)
    var downloader = dps.download(location, {name: 'cookcounty.csv'})
    downloader.on('done', function (resource) {
      t.ifError(err)
      t.same(resource.location, location, 'location same')
      t.same(resource.name, 'cookcounty.csv', 'name same')
      t.ok(fs.existsSync(path.join(tmp, resource.name)), 'resource path exists')
      var gotten = dps.get({name: resource.name})
      t.deepEquals(gotten, resource, 'resource same')
      dps.save(function (err) {
        t.ifError(err)
        t.ok(fs.existsSync(dps.configPath), 'config path exists')
        dps.destroy(function (err) {
          t.ifError(err)
          t.false(fs.existsSync(dps.configPath), 'successfully destroys config path')
          t.false(fs.existsSync(path.join(tmp, resource.name)), 'successfully destroys resource')
          t.end()
        })
      })
    })
  })
})
