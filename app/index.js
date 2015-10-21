var path = require('path')
var elementClass = require('element-class')
var Ractive = require('ractive-toolkit')
var iterate = require('stream-iterate')
var page = require('page')
var shell = require('shell')
var dom = require('dom')
var fs = require('fs')
var ipc = require('ipc')

var dps = require('..')() // TODO: support projects
var IMG_PATH = path.join(__dirname, 'img')

var ACTIVE_DOWNLOADERS = {}

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
  search: function (event, text) {
    var self = this
    var results = []
    self.set('results', results)
    var read = iterate(dps.search(text))
    function loop () {
      self.set('loading', true)
      read(function (err, data, next) {
        if (err) return onerror(err)
        for (var i in data.data.items) {
          var result = data.data.items[i]
          results.push(result)
        }
        self.set('results', results)
        self.set('loading', false)
        next()
        loop()
      })
    }
    loop()
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
  download: function (event) {
    var self = this
    var location = self.get('location')
    var args = {}
    if (location.trim().length === 0) return

    var downloader = dps.download(location, args)
    downloader.finished = false
    downloader.on('done', function (err, resource) {
      if (err) return onerror(err)
      downloader.finished = true
      update()
      done(self, resource.name + ' downloaded successfully!')
    })
    downloader.on('resource', function (resource) {
      downloader.resource = resource
    })
    downloader.on('child', function (child) {
      child.stdout.on('data', function (data, enc, next) {
        downloader.output += data.toString()
        update()
        next(null, data)
      })
      child.stderr.on('data', function (data) {
        downloader.output += data.toString()
        update()
      })
    })
    function progress (stream) {
      stream.on('data', function (data, enc, next) {
        downloader.progress += data.length
        update()
        next(null, data)
      })
    }
    ACTIVE_DOWNLOADERS[location] = downloader
    progress(downloader)
    function update () {
      self.set('downloaders', ACTIVE_DOWNLOADERS)
    }
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
  downloaders: fs.readFileSync(path.join(__dirname, 'templates', 'downloaders.html')).toString()
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
  downloaders: function (ctx, next) {
    ctx.template = templates.downloaders
    ctx.data = {downloaders: ACTIVE_DOWNLOADERS}
    render(ctx)
  },
  portals: function (ctx, next) {
    ctx.template = templates.portals
    ctx.data = {
      resources: dps.config.resources,
      core_portals: dps.core_portals,
      portals: dps.config.portals
    }
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
page('/downloads', routes.downloaders)
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
