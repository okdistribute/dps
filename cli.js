#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var path = require('path')
var through = require('through2')
var relativeDate = require('relative-date')
var prettyBytes = require('pretty-bytes')

var dps = require('./')(args.path)
exec(args._[0])

function exec (cmd) {
  if (cmd === 'download') {
    var url = args._[1]
    if (!url || args.help) return usage('dps download <url> [path] -n <a nice name>')
    args.name = args.name || args.n || args._[2]
    var downloader = dps.download(url, args)
    downloader.on('done', function (resource) {
      if (err) abort(err)
      console.log(resource)
    })
    downloader.on('child', function (child) {
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
    })
    return
  }

  if (cmd === 'add') {
    return usage('Not Implemented! Help out: http://github.com/karissa/dps')
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
    if (args.help) return usage('dps update [name]')
    var cb = function (err, data) {
      if (err) abort(err)
      done(data)
    }
    name = args._[1]
    if (name) return dps.updateOne(name, cb)
    return dps.updateAll(cb)
  }

  if (cmd === 'destroy') {
    if (args.help) return usage('dps destroy removes everything!')
    return dps.destroy(function (err) {
      if (err) abort(err)
      console.log('goodbye')
    })
  }

  if (cmd === 'check') {
    if (args.help) return usage('dps fetch [name]')
    name = args._[1]
    cb = function (err, data) {
      if (err) abort(err)
      return exec('status')
    }
    if (name) return dps.check(name, cb)
    else return dps.checkAll(cb)
  }

  if (cmd === 'search') {
    var query = args._[1]
    if (args.help || !query) return usage('dps search <query>')
    return dps.search(query).pipe(through.obj(function (results, enc, next) {
      output = ''
      var searcher = results.searcher
      for (var i in results.data.items) {
        var result = results.data.items[i]
        output += searcher.name + ' | ' + result.title + ' \n  ' + result.url + '\n\n'
      }
      next(null, output)
    })).pipe(process.stdout)
  }

  if (cmd === 'status' || cmd === 'st') {
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
      }
    }

    return console.log(output)
  }

  if (cmd === 'track') {
    url = args._[1]
    return dps.addPortal(url, args, function (err, portal) {
      if (err) abort(err)
      done(portal)
    })
  }

  usage(fs.readFileSync(path.join(__dirname, '/usage/root.txt')).toString())
}

function done (message) {
  dps.save(function (err) {
    if (err) abort(err)
    console.log(message)
  })
}

function abort (err) {
  console.trace(err)
  process.exit(1)
}

function usage (message) {
  console.error(message)
  process.exit(0)
}
