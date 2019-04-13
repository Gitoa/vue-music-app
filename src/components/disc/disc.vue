<template>
  <transition name='slide'>
    <music-list :title='title' :bg-image='bgImage' :songs='songs'></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getSongList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'

export default {
  components: {
    MusicList
  },
  created () {
    this._getSongList()
  },
  data () {
    return {
      songs: []
    }
  },
  computed: {
    title() {
      return this.disc.discname
    },
    bgImage() {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc'
    ])
  },
  methods: {
    _getSongList () {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if(isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style lang='scss' scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}
.slide-enter, .slide-leave-to {
  transform: translated3d(100%, 0, 0);
}
</style>