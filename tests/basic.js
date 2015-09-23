var test = require('tape')
var tmp = require('os').tmpdir()
var path = require('path')
var fs = require('fs')
var dps = require('..')(tmp)

var location = 'http://www.opendatacache.com/cookcounty.socrata.com/api/views/26vc-nmf3/rows.csv'

test('add/get/destroy', function (t) {
  dps.destroy(function (err) {
    t.ifError(err)
    dps.add(location, {name: 'cookcounty.csv'}, function (err, resource) {
      t.ifError(err)
      t.same(resource.location, location)
      t.same(resource.name, 'cookcounty.csv')
      t.ok(fs.existsSync(resource.path), 'resource path exists')
      var gotten = dps.get({name: resource.name})
      t.ifError(err)
      t.deepEquals(gotten, resource)
      dps.save(function (err) {
        t.ifError(err)
        t.ok(fs.existsSync(dps.configPath))
        dps.destroy(function (err) {
          t.ifError(err)
          t.false(fs.existsSync(dps.configPath))
          t.false(fs.existsSync(resource.path))
          t.end()
        })
      })
    })
  })
})

test('adding the same url throws error', function (t) {
  dps.add(location, {name: 'cookcounty.csv'}, function (err, resource) {
    dps.add(location, {name: 'cookcounty2.csv'}, function (err, resource) {
      t.ok(err)
      t.end()
    })
  })
})
