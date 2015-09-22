var path = require('path')
var elementClass = require('element-class')
var Ractive = require('ractive-toolkit')
var page = require('page')
var dom = require('dom')
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

var templates = {
  search: fs.readFileSync(path.join(__dirname, 'templates', 'search.html')).toString(),
  sources: fs.readFileSync(path.join(__dirname, 'templates', 'sources.html')).toString()
}

var routes = {
  sources: function (ctx, next) {
    ctx.template = templates.sources
    ctx.data = {sources: dps.config.sources}
    render(ctx)
  },
  search: function (ctx, next) {
    ctx.template = templates.search
    ctx.data = {sources: dps.config.sources}
    render(ctx)
  }
}

// set up routes
page('/', routes.sources)
page('/search', routes.search)
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

  dom('.sidebar__item').each(function (el) {
    el[0].onclick = function (event) {
      dom('a.sidebar__item').each(function (el) {
        elementClass(el[0]).remove('selected')
      })
      var e = elementClass(this)
      if (!e.has('selected')) e.add('selected')
    }
  })

  ract.on(events)
  return ract
}
