#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var path = require('path')
var through = require('through2')
var relativeDate = require('relative-date')
var progress = require('progress-string')
var diff = require('ansi-diff-stream')()
var prettyBytes = require('pretty-bytes')
var fetch = require('./lib/fetch')

var dps = require('./')(args.path)
exec(args._[0])


function exec (cmd) {
  if (cmd === 'add') {
    var url = args._[1]
    if (!url || args.help) return usage('add')
    args.name = args.name || args.n || args._[2]

    return fetch(url, args, function (err, resource) {
      if (err) abort(err)
      process.stdout.write('Downloading...')
      if (resource.size) {
        var bar = progress({width: 25, total: resource.size})
        var interval = setInterval(function () {
          var loc = dps.downloadLocation(resource)
          fs.lstat(loc, function (err, stat) {
            var percentage = ((stat.size / resource.size) * 100).toFixed(2)
            diff.write('[' + bar(stat.size) + `] ${percentage} %`)
          })
        }, 250)
      }
      diff.pipe(process.stdout)
      dps.download(resource, function (err) {
        if (err) return abort(err)
        process.stdout.write('done!\n')
        console.log(resource)
      })
    })
  }

  if (cmd === 'rm' || cmd === 'remove') {
    var name = args._[1]
    if (!name || args.help) return usage('dps rm <name>')
    return dps.remove(name, function (err, data) {
      if (err) abort(err)
      done('Successfully deleted.')
    })
  }

  if (cmd === 'update') {
    if (args.help) return usage('update')
    name = args._[1]
    if (!name) {
      return dps.update(function (err) {
        if (err) abort(err)
        done('Successfully updated.')
      })
    }
    var resource = dps.get({name: name})
    var cb = function (err, data) {
      if (err) abort(err)
      done(data)
    }
    dps.updateResource(resource, function (err, resource) {
      if (err) abort(err)
      console.log(resource)
    })
  }

  if (cmd === 'destroy') {
    if (args.help) return usage('dps destroy removes everything!')
    return dps.destroy(function (err) {
      if (err) abort(err)
      console.log('goodbye')
    })
  }

  if (cmd === 'search') {
    var query = args._[1]
    if (args.help || !query) return usage('dps search <query>')
    return dps.search(query).pipe(through.obj(function (results, enc, next) {
      var output = ''
      var searcher = results.searcher
      for (var i in results.data.items) {
        var result = results.data.items[i]
        output += searcher.name + ' | ' + result.title + ' \n  ' + result.url + '\n\n'
      }
      next(null, output)
    })).pipe(process.stdout)
  }

  if (cmd === 'status' || cmd === 'st') {
    if (args.help) return usage('status')
    cb = function (err, data) {
      if (err) abort(err)
      var output = ''
      for (var key in dps.config.resources) {
        if (dps.config.resources.hasOwnProperty(key)) {
          var resource = dps.config.resources[key]
          output += '\n'
          output += resource.name + '\n'
          output += resource.location + '\n'
          output += '  checked: ' + relativeDate(new Date(resource.meta.checked))
          output += '  modified: ' + relativeDate(new Date(resource.meta.modified))
          output += '  size: ' + prettyBytes(resource.size)
          output += '\n'
          return console.log(output)
        }
      }
    }

    name = args._[1]
    if (name) return dps.check(name, cb)
    else return dps.checkAll(cb)
  }

  if (cmd === 'track') {
    url = args._[1]
    return dps.addPortal(url, args, function (err, portal) {
      if (err) abort(err)
      done(portal)
    })
  }

  usage('root')
}

function done (message) {
  dps.save(function (err) {
    if (err) abort(err)
    console.log(message)
  })
}

function abort (err) {
  console.error(err)
  console.trace(err)
  process.exit(1)
}

function usage (name) {
  var message = fs.readFileSync(path.join(__dirname, 'usage', name + '.txt')).toString()
  console.error(message)
  process.exit(0)
}
