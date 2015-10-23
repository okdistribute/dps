var test = require('tape')
var tmp = require('os').tmpdir()
var dps = require('..')(tmp)

var location = 'http://www.opendatacache.com/cookcounty.socrata.com/api/views/26vc-nmf3/rows.csv'

test('adding the same url throws error', function (t) {
  dps.destroy(function (err) {
    t.ifError(err, 'destroy success')
    var downloader = dps.download(location, {name: 'cookcounty.csv'})
    downloader.on('done', function (resource) {
      t.ifError(err, 'add first time ok')
      downloader = dps.download(location, {name: 'cookcounty2.csv'})
      downloader.on('done', function (resource) {
        t.ok(err, 'adding second time is an error')
        dps.destroy(function (err) {
          t.ifError(err, 'destroy success')
          t.end()
        })
      })
    })
  })
})
