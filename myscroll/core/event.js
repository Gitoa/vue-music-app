export default {
  _touchstart (e) {
    console.log('_touchstart')
    if (!this.options.scrollable || this.update || this.load) {
      return
    }
    //preventDefault/stopPropagation
    //stop()终止滚动等
    this.stop()
    this.startPos = this.pos
    this.startTime = Date.now()
    let mark = this.options.direction
    let point = e.touches[0]
    this.prePos = point['client' + mark]
    this.preTime = this.startTime
    this.velocity = 0
    this.delta = 0
    this.distance = 0
  },

  _touchmove (e) {
    console.log('_touchmove')
    console.log(this.update, this.load, this.isMoved)
    if (this.isMoved || this.update || this.load) {
      return
    }
    if (!this.scrolling) {
      this._trigger('scrollStart')
      this.scrolling = true
    }
    this.onplay = false //中断自动播放
   
    if (!this.options.scrollable) {
      return
    }
    let mark = this.options.direction
    let point = e.touches[0]
    this.currentPos = point['client' + mark]
    this.delta = this.currentPos - this.prePos
    let newPos = this.pos + this.delta
    switch (this.options.autoplay) {
      case true:
      //说明是轮播，不能进行自由滚动，仅支持相邻图片切换 
        newPos = this.pos + this.delta
        if (newPos > this.maxScrollPos || newPos < this.minScrollPos) {
          return;
        }
        break;
      default:
        this.currentTime = Date.now()
    
        this.delta = this.currentPos - this.prePos
        this.distance += (Math.abs(this.delta))
        this.duration = this.currentTime - this.preTime
        this.velocity = (this.delta/this.duration)
        if (this.pos <= (this.minScrollPos - this.options.bottomBounceDistance)) {//超出上拉边界
          if (this.delta <0 ) newPos = this.minScrollPos - this.options.bottomBounceDistance
        } else if (this.pos >= (this.maxScrollPos + this.options.topBounceDistance)) {//超出下拉边界
          if (this.delta > 0) newPos = this.maxScrollPos + this.options.topBounceDistance
        } else if (this.pos >= this.maxScrollPos || this.pos <= this.minScrollPos) {
          this.delta /= 3
          newPos = this.pos + this.delta
        }
      }
      this._translate(newPos)
      this.prePos = this.currentPos
      this.preTime = this.currentTime
      this.totalDuration += this.duration
      console.log('currentPoint: ', point.pageX, point.pageY)
      console.log('left:', this.wrapElLeft, ' right:', this.wrapElRight, ' top:', this.wrapElTop, ' bottom: ', this.wrapElBottom)
      //需要做一次边界判断，若触摸点超出容器范围，直接触发touchend
      if (point.pageX >= this.wrapElRight || point.pageX <= this.wrapElLeft || point.pageY >= this.wrapElBottom || point.pageY <= this.wrapElTop) {
        console.log('out of range')
        this._touchend()
      }
  },

  _touchend (e) {
    console.log('touchend')
    if (this.update || this.load) {
      return
    }
    if (this.isMoved) {
      return
    }
    this.isMoved = true
    switch (this.options.autoplay) {
      case true:
        //轮播，需要根据位置判断切换
        let newIndex = 0
        let currentPos = Math.abs(this.pos)
        let eleIndex = parseInt(currentPos / this.wrapSize)
      
        if (this.onplay) {
          //处于自动播放过程中，被触摸中断（未发生移动），需要继续播放
          newIndex = eleIndex + 1
          this._scrollToElement(newIndex, this.options.playDuration, 'swipe')
          break;
        }
        //播放中发生拖动，播放停止，根据拖动情况跳转
        let offsetPos = currentPos % this.wrapSize
        if (offsetPos < (this.wrapSize / 2)) {
          newIndex = eleIndex
        } else {
          newIndex = eleIndex + 1
        }
        this._scrollToElement(newIndex, this.options.bounceDuration, 'swipe')
        break;
      default:
        if (this.pos < this.minScrollPos) { 
          //超出右侧、底部
          if (this.options.load && this.minScrollPos - this.pos > this.options.loadTriggerDistance) {
            //触发了底部加载事件
            this.updateLoadLock = true
            this.load = true
            this._trigger('load')
            this.loadTimer = setTimeout(() => {
              this._bounceToBottom()
              this.updateLoadLock = false
            }, this.options.loadTriggerDelay)
          } else {
            this._bounceToBottom()
          }
          return
        } else if (this.pos > this.maxScrollPos) {  
          //超出左侧、顶部
          if (this.options.update && this.pos - this.maxScrollPos > this.options.updateTriggerDistance) {
            //触发了顶部更新事件
            this.updateLoadLock = true
            this.update = true
            this._trigger('update')
            this.updateTimer = setTimeout(() => {
              this._bounceToTop()
            }, this.options.updateTriggerDelay)
          } else {
            this._bounceToTop()
          }
          return
        }
        this.currentTime = Date.now()

        //判断是否满足惯性滚动条件，间隔时间小于阈值，速度大于阈值，位置位于区间内
        //mac下手势触发存在延迟，暂时关闭
        
        if ((this.currentTime - this.preTime >= this.options.momentumLimitTime) || (this.distance <= this.options.momentumLimitDistance)) {
          return
        }
        if (this.velocity !== 0) {
          let {duration, targetPos} = this._computedDistance(this.velocity)
          let easing = 'swipe'
          if (targetPos < this.minScrollPos || targetPos > this.maxScrollPos) {
            easing = 'swipeBounce'
          }
          this._scrollTo(targetPos, duration, easing)
          this.velocity = 0
        }
    }
  },

  _touchcancel (e) {
    console.log('_touchcancel')
    this._touchend(e)
  },

  _transitionend (e) {
    this.isInTransition = false
    this._trigger('scrollEnd')
    if (!this.updateLoadLock) {
      this.update = false
      this.load = false
    }
    this.scrollStyle.transitionDuration = '0ms'
    this.pos = this._getPos()
    this.eleIndex = this._getElementIndex()
    if (this.options.autoplay) {
      //轮播，不需要回弹，判断循环
      if (this.playTimer) {
        clearTimeout(this.playTimer)
      }
      if (!this.options.loop && (this.eleIndex === this.len - 1)){
        //非循环轮播且已经到达最后一个元素
        return
      }
      this.playTimer = setTimeout(() => {
        this.onplay = true
        this._scrollToElement(this.eleIndex + 1, this.optionsDuration, 'ease')
      }, 1000)
      if (this.options.loop) {
        if (this.eleIndex == 0) {
          this._translateToElement(this.len - 2)
        } else if (this.eleIndex == this.len - 1) {
          this._translateToElement(1)
        }
      }
      return
    }
    //判断是否需要回弹
    if (this.pos > this.maxScrollPos) {
      this._bounceToTop()
    } else if(this.pos < this.minScrollPos) {
      this._bounceToBottom()
    }
  }
}