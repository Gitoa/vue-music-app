import {ease} from '../utils/const'
import {requestAF} from '../utils/util'

export default {

  _translate (pos) {
    let mark = this.options.direction
    this.pos = pos
    this.scrollStyle.transform = `translate${mark}(${pos}px) ${this.translateZ}`
    this._trigger('scroll', this.pos)
  },

  _transition (duration, style) {
    this.scrollStyle.transitionDuration = duration
    this.scrollStyle.transitionTimingFunction = style ? ease[style] : 'linear'
  },

  _scrollTo (pos, duration, style) {
    this.isInTransition = true
    if (pos === this.pos) {
      this._transitionend()
      return
    }
    if (!duration) {
      duration = 0
    }
    this._transition(duration + 'ms', style)
    this._animation()
    this._translate(pos)
  },

  _translateToElement (index) {
    let newPos = this.scrollElChildPos[index]
    this.eleIndex = index
    this._translate(newPos)
  },

  _scrollToElement (index, duration, style) {  //滚动到指定元素
    console.log('scrollToEle', index)
    duration = duration == 0 ? duration : duration || this.options.playDuration
    style = style || this.options.playStyle
    let newPos = this.scrollElChildPos[index]
    this._scrollTo(newPos, duration, style)
  },

  _bounceToTop () {
    this._transition(this.options.topBounceTime + 'ms', 'bounce')
    this._translate(this.maxScrollPos)
  },

  _bounceToBottom () {
    this._transition(this.options.bottomBounceTime + 'ms', 'bounce')
    this._translate(this.minScrollPos)
  },

  _getPos () {
    let mark = this.options.direction
    return mark === 'Y' ? this._getTranslateY() : this._getTranslateX()
  },

  _getElementIndex () { //获得当前的元素索引
    let pos = this.pos
    let index = this.scrollElChildPos.findIndex((value) => value < pos)
    return index === -1 ? this.scrollElChildPos.length - 1 : index - 1
  },

  _getTranslateX () { //平滚时将最右侧设为0，需要进行一定转换
    let matrix = new WebKitCSSMatrix(this.computedStyle.webkitTransform)
    return matrix.m41
  },

  _getTranslateY () {
    let matrix = new WebKitCSSMatrix(this.computedStyle.webkitTransform)
    return matrix.m42
  },

  _computedDistance (velocity) {
    let duration = this.options.momentumDuration
    let targetPos = this.pos + (velocity / this.options.deceleration)

    // 超出边界,减小惯性距离
    if (targetPos < this.minScrollPos) {
      duration = this.options.momentumBounceDuration
      targetPos = this.minScrollPos - Math.min((this.minScrollPos - targetPos) / 3, this.options.loadTriggerDistance)
    } else if (targetPos > this.maxScrollPos) {
      duration = this.options.momentumBounceDuration
      targetPos = this.maxScrollPos + Math.min((targetPos - this.maxScrollPos) / 3, this.options.updateTriggerDistance)
    }
    console.log(duration, targetPos)
    return {
      duration,
      targetPos: Math.round(targetPos)
    }
  },

  _getSize (el, mark) { //获得el包含元素的高度/宽度之和
    let size = 0;
    let children = el.children
    for (let child of children) {
      size += (mark === 'Y' ? child.offsetHeight : child.offsetWidth)
    }
    return size
  },

  _getChildPos (el, mark) {
    let arr = []
    let pos = 0
    let children = el.children
    for (let child of children) {
      arr.push(pos)
      pos -= mark === 'Y' ? child.offsetHeight : child.offsetWidth
    }
    return arr
  },

  _animation () {
    if (!this.listener['scroll']) {
      return
    }
    this._trigger('scroll', this._getPos())
    this.animationTimer = requestAF(() => {
      if (this.isInTransition) {
        this._animation()
      }
    })
  },

  getLeft (el) {
    let left = el.offsetLeft
    if (el.offsetParent !== null) left += this.getLeft(el.offsetParent)
    return left
  },

  getTop (el) {
    let top = el.offsetTop
    if (el.offsetParent !== null) top += this.getTop(el.offsetParent)
    return top
  },

  getCurrentPage () {
    let page = this._getElementIndex()
    if (this.options.loop) {
      return page == (this.len - 1) ? 0 : page - 1
    }
    return page
  },

  on (event, fn) {  //注册监听函数
    if (!this.listener[event]) {
      this.listener[event] = []
    }
    this.listener[event].push(fn)
  },

  off (event, fn) { //取消监听
    if (!fn) {
      return
    }
    if (this.listener[event]) {
      let index = this.listener[event].findIndex((item) => item === fn)
      if (index !== -1) {
        this.listener[event].splice(index,1)
      }
    }
  },

  update (result=false) {
    //实例在监听下拉触发的update事件后需要调用该方法返回更新成果与否
    if (result) {

    } else {

    }
    this.updataLoadLock = false
    this.updateLoad = false
  },

  scrollTo (pos) {
    this._scrollTo(pos)
  },

  scrollToElement (index, duration, style) {
    this._scrollToElement(index, duration, style)
  },

  load (result=false) {
    clearTimeout(this.loadTimer)
    if (result) {

    } else {
      this._bounceToBottom()
    }
    this.updataLoadLock = false
    this.updateLoad = false
  },

  _trigger (event, argument) {  //触发事件
    if (this.listener[event]) {
      this.listener[event].forEach((fn) => {
        fn(argument)
      })
    }
  },

  stop () { //停止当前行为（transition，将所有transition-property设为当前值，并且将transition-duration设为0ms
    console.log('stop the scrolling')
    let mark = this.options.direction
    this.pos = mark === 'Y' ? this._getTranslateY() : this._getTranslateX()
    this.scrollStyle.transitionDuration = '0ms'
    this._translate(this.pos)
    this.eleIndex = this._getElementIndex()
    if (this.playTimer) {
      clearTimeout(this.playTimer)
    }
    if (this.animationTimer) {
      this.animationTimer = null
    }
    this.isMoved = false
    console.log('isMoved:', this.isMoved)
  },

  refresh() { //需要对实例进行更新，scrollEl发生了改变，更新高度/宽度以及相应的边界信息
    console.log('refresh')
    let mark = this.options.direction
    let scrollElSize = this._getSize(this.scrollEl, mark)
    if (mark === 'Y') {
      this.scrollEl.style.height = scrollElSize + 'px'
      this.minScrollPos = this.wrapEl.offsetHeight - this.scrollEl.offsetHeight
    } else {
      this.scrollEl.style.width = scrollElSize + 'px'
      this.minScrollPos = this.wrapEl.offsetWidth - this.scrollEl.offsetWidth
    }
    console.log(this.minScrollPos)
    this.maxScrollPos = 0   //最大位置，超出回弹（下拉为正，左拉为正，对应顶部位置，同时对应左侧位置
    this.topBound = this.maxScrollPos + this.options.topBounceDistance //顶部下拉最大位置，左侧左拉最大位置
    this.bottomBound = this.minScrollPos - this.options.bottomBounceDistance  //底部上拉最小位置 ，右侧右拉最小位置
    console.log(this.bottomBound)
    this.scrollElChildPos = this._getChildPos(this.scrollEl, mark)  //更新子元素位置信息
    this.len = this.scrollElChildPos.length
    this.animationTimer = null
    this.loadTimer = null
    this.updateTimer = null
    this.wrapElTop = this.getTop(this.wrapEl) //wrap元素在页面中的位置
    this.wrapElLeft = this.getLeft(this.wrapEl) 
    this.wrapElBottom = this.wrapElTop + this.wrapEl.offsetHeight
    this.wrapElRight = this.wrapElLeft + this.wrapEl.offsetWidth
    if (this.options.autoplay) {
      this.playTimer = setTimeout(() => {
        this._scrollToElement(this.eleIndex + 1)
      }, this.options.interval)
    }
  }
}