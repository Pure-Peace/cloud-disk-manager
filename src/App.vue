<template>
  <div id="app">
    <topbar
      ref="topbar"
      :win="win"
    />
    <div
      id="app-content"
      :style="`height: calc(100% - ${$bus.topbarHeight}px);`"
    >
      <leftbar :win="win" />
      <router-view id="app-router-view" />
      <!--locale-changer style="position: fixed; right: 30px; top: 50px;" /-->
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
import topbar from '@/layouts/topbar.vue'
import leftbar from '@/layouts/leftbar.vue'
// import localeChanger from 'components/localeChanger'

export default {
  components: {
    // localeChanger,
    topbar,
    leftbar
  },
  data () {
    return {
      win: remote.getCurrentWindow()
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
// app
#app-content {
    display: flex;
}

#app {
  height: 100%;
  width: 100%;
}

#app-router-view {
  flex: 1;
  border-top-left-radius: 8px;
}
</style>
