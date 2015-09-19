var path = require('path')
var Ractive = require('ractive-toolkit')
var page = require('page')
var fs = require('fs')
var ipc = require('ipc')

var dps = require('..')
var configSync = require('../lib/util/config.js')

function getSources () {
  var args = {}
  var config = configSync.read(args)
  console.log(config.sources)
  return config.sources
}

function onerror (err) {
  var message = err.stack || err.message || JSON.stringify(err)
  console.error(message)
  window.alert(message)
}

var templates = {
  main: fs.readFileSync(path.join(__dirname, 'main.html')).toString()
}

var events = {
  refresh: function (event, name) {
    var self = this
    var args = {}
    dps.update(name, args, function (err, source) {
      if (err) return onerror(err)
      self.set('sources', getSources())
    })
  },
  add: function () {
    var self = this
    var location = this.get('location')
    var args = {}
    dps.add(location, args, function (err, source) {
      if (err) return onerror(err)
      self.set('sources', getSources())
    })
  },
  quit: function () {
    ipc.send('terminate')
  }
}

var routes = {
  main: function (ctx, next) {
    ctx.template = templates.main
    ctx.data = {sources: getSources()}
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
