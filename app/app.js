var BrowserWindow = require('browser-window')
var path = require('path')

var APP_NAME = 'DPS'
var INDEX = 'file://' + path.join(__dirname, 'index.html')

var app = require('app')
app.on('ready', appReady)

var mainWindow

function appReady () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    title: APP_NAME
  })
  mainWindow.loadUrl(INDEX)
  mainWindow.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
