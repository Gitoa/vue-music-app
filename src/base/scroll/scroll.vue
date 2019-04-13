<template>
  <div ref='wrapper'>
    <slot></slot>
  </div>
</template>

<script>
import MyScroll from '../../../myscroll/index.js'
export default {
  name: 'Scroll',
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    },
  },
  mounted () {
    console.log(this.probeType)
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll () {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new MyScroll(this.$refs.wrapper, {
        load: this.pullup
      })
      if (this.listenScroll) {
        let _this = this
        this.scroll.on('scroll', (pos) => {
          _this.$emit('scroll', pos)
        })
      }
      if (this.pullup) {
        let _this = this
        this.scroll.on('load', () => {
          _this.$emit('pullup')
        })
      }
      if (this.beforeScroll) {
        this.scroll.on('scrollStart', () => {
          this.$emit('scrollStart')
        })
      }
    },
    enable () {
      this.scroll && this.scroll.enable()
    },
    disable () {
      this.scroll && this.scroll.disable()
    },
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    scrollTo () {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    },
    scrollToEl () {
      this.scroll && this.scroll.scrollToEl.apply(this.scroll, arguments)
    },
    update (result) {
      this.scroll && this.scroll.checkUpdate(result)
    },
    load (result) {
      this.scroll && this.scroll.checkLoad(result)
    },
  },
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
      }, 20)
    }
  }
}
</script>

<style lang='scss' scoped>
</style>