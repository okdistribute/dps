var dom = require('dom')

module.exports = function (container, selector, cb) {
  var items = dom(selector)
  var open = false
  items.forEach(function (item) {
    item.onclick = function (event) {
      if (open) return
      var contents = item.textContent
      var input = createInputElement(contents)
      item.innerHTML = ''
      item.appendChild(input)
      open = true
    }
    container.onclick = function (event) {
      if (!open) return
      var contents = item.textContent
      cb(contents)
      item.innerHTML = contents
      open = false
    }
  })

  function createInputElement (contents) {
    var input = document.createElement('input')
    input.setAttribute('value', contents)
    input.setAttribute('type', 'text')
    return input
  }
}
