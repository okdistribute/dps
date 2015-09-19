var menubar = require('menubar')
var ipc = require('ipc')
var path = require('path')

var mb = menubar({
  dir: path.join(__dirname, 'menubar'),
  width: 300,
  height: 480
})

mb.on('ready', function ready () {
  console.log('ready')
})

ipc.on('terminate', function terminate (ev) {
  mb.app.terminate()
})
