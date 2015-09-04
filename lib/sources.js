var config = require('./config.js')

module.exports = {
  add: add
}

function add (source, opts) {
  var cur = config.read(opts)
  if (cur.sources[source.name]) {
    console.log('Source updated.')
  } else {
    console.log('Source added.')
  }
  cur.sources[source.name] = source
  config.update(cur)
}
