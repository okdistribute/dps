var path = require('path')
var Ractive = require('ractive-toolkit')
var page = require('page')
var fs = require('fs')
var ipc = require('ipc')

var dps = require('..')() // TODO: support projects

function onerror (err) {
  var message = err.stack || err.message || JSON.stringify(err)
  console.error(message)
  window.alert(message)
}

function done () {
  // call with bind
  var ractive = this
  dps.save(function (err) {
    if (err) return onerror(err)
    ractive.set('sources', dps.config.sources)
  })
}

var templates = {
  main: fs.readFileSync(path.join(__dirname, 'main.html')).toString()
}

var events = {
  refresh: function (event, location) {
    var self = this
    var args = {}
    dps.updateOne(location, function (err, source) {
      if (err) return onerror(err)
      done.bind(self)()
    })
  },
  add: function () {
    var self = this
    var location = this.get('location')
    var args = {}
    dps.add(location, function (err, source) {
      if (err) return onerror(err)
      done.bind(self)()
    })
  },
  quit: function () {
    ipc.send('terminate')
  }
}

var routes = {
  main: function (ctx, next) {
    ctx.template = templates.main
    ctx.data = {sources: dps.config.sources}
    render(ctx)
  }
}

// set up routes
page('/', routes.main)

// initialize
page.start()
page('/')

function render (ctx) {
  var ract = new Ractive({
    el: '#content',
    template: ctx.template,
    data: ctx.data,
    onrender: ctx.onrender
  })

  ract.on(events)
  return ract
}
