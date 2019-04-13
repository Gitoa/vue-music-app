<template>
  <scroll class='suggest' :data='result' :pullup='pullup' @pullup='searchMore' ref='scroll' :beforeScroll='beforeScroll' @scrollStart='listScroll'>
    <ul class='suggest-list'>
      <li class='suggest-item' v-for='item in result' @click='selectItem(item)'>
        <div class='icon'>
          <i :class='getIconCls(item)'></i>
        </div>
        <div class='name'>
          <p class='text' v-html='getDisplayName(item)'></p>
        </div>
      </li>
       <loading v-show='hasMore' title='' class='loading'></loading>
    </ul>
    <div class='no-result-wrapper' v-show='!hasMore && !result.length'>
      <no-result title='抱歉，暂无搜索结果'></no-result>
    </div>
  </scroll>
</template>

<script>
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {createSong, processSongsUrl} from 'common/js/song'
import NoResult from 'base/no-result/no-result'
import Loading from 'base/loading/loading'
import Scroll from 'base/scroll/scroll'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'

const TYPE_SINGER = 'singer'
const perpage = 20

export default {
  components: {
    Scroll,
    Loading,
    NoResult,
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      beforeScroll: true,
    }
  },
  methods: {
    ...mapMutations ({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions ([
      'insertSong'
    ]),
    search () {
      this.page = 1
      this.hasMore = true
      this.$refs.scroll.scrollTo(0)
      search(this.query, this.page, this.showSinger, perpage).then(async(res) => {
        if (res.code === ERR_OK) {
          this.result = await this._genResult(res.data)
          this._checkMore(res.data)
        }
      })
    },
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then(async (res) => {
        if (res.code === ERR_OK) {
          this.result = await this.result.concat(this._genResult(res.data))
          this._checkMore(res.data)
          this.$refs.scroll.load(true)
        }
      })
    },
    listScroll () {
      this.$emit('listScroll')
    },
    getIconCls (item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName (item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername,
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    async _genResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      if (data.song) {
        await processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
          ret = ret.concat(songs)
        })
      }
      return ret
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    _checkMore(data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
        this.hasMore = false
      }
    }
  },
  watch: {
    query () {
      this.search()
    }
  }
}
</script>

<style lang='scss' scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
      }
      .icon {
        flex: 0 0 30px;
        width: 30px;
        [class^="icon-"] {
          font-size: 14px;
          color: $color-text;
        }
      }
      .name {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text;
        overflow: hidden;
        .text {
          @include no-wrap();
        }
      }
    }
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>