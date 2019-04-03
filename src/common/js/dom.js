export function addClass (el, className) {
  el.classList.add(className)
}

export function hasClass (el, className) {
  el.classList.contains(className)
}

export function getData(el, name, val) {
   const prefix = 'data-'
   name = prefix + name
   if (val) {
     return el.setAttribute(name, val)
   } else {
     return el.getAttribute(name)
   }
}

let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform',
  }
  
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  
  return false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}