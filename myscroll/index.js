import config from './config'
import event from './core/event'
import init from './core/init'
import method from './core/method'
import scrollbar from './core/scrollbar'

export default function MyScroll (el, options) {
  let _this = this
  this.wrapEl = typeof el === 'string' ? document.querySelector(el) : el
  if (!this.wrapEl) {
    console.log('can not resolve the wrap dom')
    return 
  }
  this.options = Object.assign({}, config, options)
  //获取滚动节点，即第一个子节点
  let scrollEl = this.options.scrollEl
  if(!scrollEl) {
    this.scrollEl = this.wrapEl.firstElementChild
  } else {
    this.scrollEl = (typeof scrollEl === 'string') ? this.wrapEl.querySelector(scrollEl) : scrollEl
  }
  if (!this.scrollEl) {
    console.log('the wrapEl need a scroll element')
    return 
  }

  let mark = this.options.direction
  //  获得窗口大小
  if (mark === 'Y') {
    this.wrapSize = this.wrapEl.clientHeight
  } else {
    this.wrapSize = this.wrapEl.clientWidth
  }

  //设置为循环轮播时，为实现循环，需要在首尾各复制添加一个节点
  if (this.options.autoplay && this.options.loop) {
    let firstElCopy = this.scrollEl.firstElementChild.cloneNode(true)
    let lastElCopy = this.scrollEl.lastElementChild.cloneNode(true)
    this.scrollEl.insertBefore(lastElCopy, this.scrollEl.firstElementChild)
    this.scrollEl.appendChild(firstElCopy)
    //轮播时首元素现在处于第二个位置，需要移位
    this.scrollEl.style.transform = `translate${mark}(-${this.wrapSize}px)`
  }
  
  let scrollElSize = this._getSize(this.scrollEl, mark)
  console.log(scrollElSize)
  this.scrollElChildPos = this._getChildPos(this.scrollEl, mark)
  console.log(this.scrollElChildPos)
  //如果是水平滚动，需要将scrollEl元素的宽度撑开
  this.scrollStyle = this.scrollEl.style
  this.scrollStyle.transitionProperty = 'transform'
  this.scrollStyle.transitionDuration = '0s'
  this.scrollStyle.transitionTimingFunction = 'ease-out'
  this.scrollStyle.transitionDelay = '0s'
  this.translateZ = this.options.gpu ? 'translateZ(0)' : ''

  this.computedStyle = window.getComputedStyle(this.scrollEl)

  this.eleIndex = this.options.loop ? 1 : 0 //当前元素下标
  this.len = this.scrollElChildPos.length //滚动元素的个数
  
  this.pos = 0  //元素当前位置
  this.prePos = 0 //滚动事件触发的前一位置（相对值
  this.currentPos = 0 //滚动事件触发的后一位置（相对值
  this.startPos = 0 //一次完整滚动开始时元素位置
  this.pagePos = 0  //
  this.minScrollPos = 0   //最小位置，超出回弹（上拉为负，对应底部位置，同时对应左侧位置
  if (mark === 'Y') {
    this.scrollEl.style.height = scrollElSize + 'px'
    this.minScrollPos = this.wrapEl.offsetHeight - this.scrollEl.offsetHeight
  } else {
    this.scrollEl.style.width = scrollElSize + 'px'
    this.minScrollPos = this.wrapEl.offsetWidth - this.scrollEl.offsetWidth
  }
  console.log(this.pos)
  console.log(this.scrollStyle, this.scrollEl.offsetHeight)
  this.maxScrollPos = 0   //最大位置，超出回弹（下拉为正，对应顶部位置，同时对应右侧位置
  this.topBound = this.maxScrollPos + this.options.topBounceDistance //顶部下拉最大位置，右侧右拉最大位置
  this.bottomBound = this.minScrollPos - this.options.bottomBounceDistance  //底部上拉最小位置 ，左侧左拉最小位置
  this.momentumTopBound = this.maxScrollPos + this.options.updateTriggerDistance  //滚动所能到达最高位置
  this.momentumBottomBound = this.minScrollPos - this.options.loadTriggerDistance //滚动所能到达最小位置
  this.wrapElTop = this.getTop(this.wrapEl) //wrap元素在页面中的位置
  this.wrapElLeft = this.getLeft(this.wrapEl) 
  this.wrapElBottom = this.wrapElTop + this.wrapEl.offsetHeight
  this.wrapElRight = this.wrapElLeft + this.wrapEl.offsetWidth

  this.startTime = 0  //一次完整滚动开始时的时间
  this.preTime = 0  //滚动事件前一时刻
  this.currentTime = 0  //滚动时间后一时刻
  this.duration = 0 //某次滚动的时间间隔
  this.totalDuration = 0  //一次完整滚动的耗时

  this.distance = 0 //一次完整滚动的路程
  this.currentDistance = 0  //某次滚动事件的路程
  this.velocity = 0 //某次滚动事件内的速度

  this.isMoved = false  //标记是否在滚动
  this.onplay = false //标记是否处于自动播放
  this.updateLoad = false //标记是否处于更新加载阶段，此时任意事件都不能触发，仅在updateLoadLock为true时在transitionend中修改
  this.updateLoadLock = true //用于锁定updateLoad

  this.listener = []  //发布/订阅模式下订阅的事件及处理函数集合

  this.loadTimer = {}
  this.updateTimer = {}
  if (this.options.autoplay) {
    this.playTimer = setTimeout(() => {
      this._scrollToElement(this.eleIndex + 1)
    }, this.options.interval)
  }

  this.scrollEl.addEventListener('touchstart', function(e) {
    _this._touchstart(e)
  }, false)
  this.scrollEl.addEventListener('touchmove', function(e) {
    _this._touchmove(e)
  }, false)
  this.scrollEl.addEventListener('touchend', function(e) {
    _this._touchend(e)
  }, false)
  this.scrollEl.addEventListener('transitionend', function(e) {
    _this._transitionend(e)
  }, false)
  this.scrollEl.addEventListener('touchcancel', function(e) {
    _this._touchcancel(e)
  }, false)
}

Object.assign(MyScroll.prototype, init, event, method, scrollbar)