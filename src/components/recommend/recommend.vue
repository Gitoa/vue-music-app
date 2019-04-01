<template>
  <div class='recommend' ref='recommend'>
    <scroll ref='scroll' class='recommend-content' :data='discList'>
      <div>
        <div class='slider-wrapper' v-if='recommends.length'>
          <div class='slider-content'>
            <slider ref='slider'>
              <div v-for='item in recommends' class='slider-item'>
                <a :href='item.linkUrl'>
                  <img @load='loadImage' :src='item.picUrl'/>
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class='recommend-list'>
          <h1 class='list-title'>热门歌单推荐</h1>
          <ul>
            <li v-for='item in discList' class='item'>
              <div class='icon'>
                <img width = '60' height='60' v-lazy='item.imgurl'/>
              </div>
              <div class='text'>
                <h2 class='name' v-html='item.creator.name'></h2>
                <p class='desc' v-html='item.dissname'></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class='loading-container' v-show='!discList.length'>
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import Slider from 'base/slider/slider'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'

import {getRecommend, getDiscList} from 'api/recommend'
import {ERR_OK} from 'api/config'

export default {
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  },
  created () {
    this.checkLoad = false
    console.log('recommend_create')
    this._getRecommend()
    this._getDiscList()
  },
  activated () {
    console.log('recommend_active')
    setTimeout(() => {
      this.$refs.slider && this.$refs.slider.slider.refresh()
    }, 20)
  },
  destroyed () {
    console.log('recommend_destroyed')
  },
  deactivated () {
    console.log('recommend_deactivated')
  },
  methods: {
    loadImage() {
      if (!this.checkloaded) {
        this.checkloaded = true
        setTimeout(() => {
          this.$refs.scroll.refresh()
          this.$refs.slider && this.$refs.slider.slider.refresh()
        }, 20)
      }
    },
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    _getDiscList () {
      getDiscList().then((res) => {
        console.log(res)
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~common/scss/variable";
@import "~common/scss/mixin";
 .recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .recommend-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;
      .slider-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: tanslateY(-50%);
    }
    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;
        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .desc {
            color: $color-text-g;
          }
        }
      }
    }
  }
 }
</style>
