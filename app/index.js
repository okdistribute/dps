var path = require('path')
var elementClass = require('element-class')
var Ractive = require('ractive-toolkit')
var page = require('page')
var shell = require('shell')
var dom = require('dom')
var fs = require('fs')
var ipc = require('ipc')

var dps = require('..')() // TODO: support projects
var IMG_PATH = path.join(__dirname, 'img')

function onerror (err) {
  var message = err.stack || err.message || JSON.stringify(err)
  console.error(message)
  window.alert(message)
}

function done (ractive, message) {
  dps.save(function (err) {
    if (err) return onerror(err)
    ractive.set('resources', dps.config.resources)
    ractive.message('success', message)
  })
}

function ask (ractive, cb) {
  ractive.fire('toggleModal')
  var submit = dom('.modal button[type="submit"]')[0]
  submit.onclick = function () {
    cb()
    ractive.fire('toggleModal')
  }
}

var events = {
  view: function (event, id) {
    page('/view/' + id)
  },
  toggleModal: function () {
    var modal = dom('.modal')
    elementClass(modal[0]).toggle('hidden')
    var mask = dom('.modal-mask')
    elementClass(mask[0]).toggle('hidden')
  },
  remove: function (event, name) {
    var self = this
    ask(self, function () {
      dps.remove(name, function (err) {
        if (err) return onerror(err)
        done(self, name + ' deleted successfully!')
      })
    })
    return false
  },
  doUpdate: function (event, name) {
    var self = this
    dps.update(name, function (err, data) {
      if (err) return onerror(err)
      var txt = data.length ? data.length + ' resources ' : data.name
      done(self, txt + ' updated successfully!')
    })
    return false
  },
  add: function () {
    var self = this
    var location = self.get('location')
    var args = {}
    if (location.trim().length === 0) return
    dps.add(location, args, function (err, resource) {
      if (err) return onerror(err)
      self.set('location', '')
      done(self, resource.name + ' added successfully!')
    })
    return false
  },
  openUrl: function (event, url) {
    shell.openExternal(url)
    event.original.preventDefault()
  },
  quit: function () {
    ipc.send('terminate')
  }
}

var templates = {
  search: fs.readFileSync(path.join(__dirname, 'templates', 'search.html')).toString(),
  about: fs.readFileSync(path.join(__dirname, 'templates', 'about.html')).toString(),
  resources: fs.readFileSync(path.join(__dirname, 'templates', 'resources.html')).toString(),
  view: fs.readFileSync(path.join(__dirname, 'templates', 'view.html')).toString(),
  portals: fs.readFileSync(path.join(__dirname, 'templates', 'portals.html')).toString()
}

var routes = {
  about: function (ctx, next) {
    ctx.template = templates.about
    render(ctx)
  },
  view: function (ctx, next) {
    ctx.template = templates.view
    ctx.data = {resource: dps.config.resources[ctx.params.id]}
    render(ctx)
  },
  resources: function (ctx, next) {
    ctx.template = templates.resources
    ctx.data = {resources: dps.config.resources}
    render(ctx)
  },
  portals: function (ctx, next) {
    ctx.template = templates.portals
    ctx.data = {resources: dps.config.resources, portals: dps.config.portals}
    render(ctx)
  },
  search: function (ctx, next) {
    ctx.template = templates.search
    ctx.data = {resources: dps.config.resources}
    render(ctx)
  }
}

// set up routes
page('/', routes.resources)
page('/search', routes.search)
page('/about', routes.about)
page('/portals', routes.portals)
page('/view/:id', routes.view)
// initialize
page.start()
page('/')

function render (ctx) {
  if (!ctx.template) throw new Error('Template required.')
  ctx.data = ctx.data || {}
  ctx.data.IMG_PATH = IMG_PATH
  ctx.data.images = {
    refresh: fs.readFileSync(path.join(IMG_PATH, 'refresh.svg')).toString(),
    trash: fs.readFileSync(path.join(IMG_PATH, 'trash.svg')).toString()
  }
  var ract = new Ractive({
    el: '#content',
    template: ctx.template,
    data: ctx.data,
    onrender: ctx.onrender,
    message: function (type, text) {
      var ele = document.getElementsByClassName('banner')[0]
      ele.innerHTML = text
      var cl = elementClass(ele)
      cl.add(type)
      setTimeout(function () {
        cl.remove(type)
      }, 2000)
    }
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
