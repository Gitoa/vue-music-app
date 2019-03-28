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