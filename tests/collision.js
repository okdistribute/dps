var test = require('tape')
var tmp = require('os').tmpdir()
var dps = require('..')(tmp)

var location = 'http://www.opendatacache.com/cookcounty.socrata.com/api/views/26vc-nmf3/rows.csv'

test('adding the same url throws error', function (t) {
  dps.destroy(function (err) {
    t.ifError(err, 'destroy success')
    dps.download(location, {name: 'cookcounty.csv'}, function (err, resource) {
      t.ifError(err, 'add first time ok')
      dps.download(location, {name: 'cookcounty2.csv'}, function (err, resource) {
        t.ok(err, 'adding second time is an error')
        dps.destroy(function (err) {
          t.ifError(err, 'destroy success')
          t.end()
        })
      })
    })
  })
})
