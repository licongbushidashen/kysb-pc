<template>
  <div id="app">
    <router-view class="router-view" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import cache from '@/utils/cache'


export default {
  name: 'App',
  components: {},
  mixins: [],
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['activeIndex', 'userInfo'])
  },
  watch: {
    $route(to, from) {
      this.$wkPreviewFile.closeViewer() // 切换页面隐藏图片预览
    }
  },
  mounted() {
    this.addDocumentVisibilityChange()
    this.setMinHeight()
    this.TaskCenterCount()
  },
  methods: {
    TaskCenterCount() {

    },
    addDocumentVisibilityChange() {
      // 网页当前状态判断
      // hidden,
      var state, visibilityChange
      if (typeof document.hidden !== 'undefined') {
        // hidden = 'hidden'
        visibilityChange = 'visibilitychange'
        state = 'visibilityState'
      } else if (typeof document.mozHidden !== 'undefined') {
        // hidden = 'mozHidden'
        visibilityChange = 'mozvisibilitychange'
        state = 'mozVisibilityState'
      } else if (typeof document.msHidden !== 'undefined') {
        // hidden = 'msHidden'
        visibilityChange = 'msvisibilitychange'
        state = 'msVisibilityState'
      } else if (typeof document.webkitHidden !== 'undefined') {
        // hidden = 'webkitHidden'
        visibilityChange = 'webkitvisibilitychange'
        state = 'webkitVisibilityState'
      }
      // 添加监听器，在title里显示状态变化
      document.addEventListener(visibilityChange, () => {
        if (document[state] == 'visible') {
          if (cache.updateAxiosHeaders() && this.$route.name === 'login') {
            window.location.reload()
          }
        }
        this.$bus.emit('document-visibility', document[state])
      }, false)
    },

    setMinHeight() {
      this.$nextTick(() => {
        const dpr = window.devicePixelRatio || 1
        const clientWidth = document.body.clientWidth
        const dom = document.getElementById('app')
        if (dpr !== 1 && clientWidth > 1600) {
          dom.style.minHeight = '800px'
        } else if (dpr === 1 && clientWidth > 1600) {
          dom.style.minWidth = '1650px'
        } else {
          // dom.style.minWidth = '1200px'
          dom.style.minHeight = '605px'
        }
        this.$store.dispatch('getAuth').then(() => {
        })
      })
    }
  }
}
</script>

<style>
#app {
  width: 100%;
  position: relative;
  height: 100%;
  min-width: 1200px;
  min-height: 605px;
}
</style>
