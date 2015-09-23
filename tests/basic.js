var test = require('tape')
var dps = require('..')()

var location = 'http://www.opendatacache.com/cookcounty.socrata.com/api/views/26vc-nmf3/rows.csv'

test('add', function (t) {
  dps.add(location, {}, function (err, resource) {
    t.ifError(err)
    t.same(resource.location, location)
    t.same(resource.name, undefined)
    var gotten = dps.get(location)
    t.ifError(err)
    t.deepEquals(gotten, resource)
    t.end()
  })
})

test('destroy', function (t) {
  t.end()
})
