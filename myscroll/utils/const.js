const ua = window.navigator.userAgent.toLowerCase()

export const isAndroid = ua.indexOf('android') > 0

export const ease = {
  // easeOutQuint
  swipe: 'cubic-bezier(0.23, 1, 0.32, 1)',
  // easeOutQuard
  swipeBounce: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  // easeOutQuart
  bounce: 'cubic-bezier(0.165, 0.84, 0.44, 1)',

  ease :'cubic-bezier(0.25,0.1,0.25,1)'
}