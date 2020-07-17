<template>
  <div id="app">
    <custom-modal name="global-modal" />
    <topbar
      ref="topbar"
      :blur="$bus.isBlur"
    />
    <div
      id="app-content"
      :style="appContentHeight"
    >
      <leftbar ref="leftbar" />

      <keep-alive>
        <router-view
          v-if="$route.meta.keepAlive"
          id="app-router-view"
        />
      </keep-alive>
      <router-view
        v-if="!$route.meta.keepAlive"
        id="app-router-view"
      />

      <!--locale-changer style="position: fixed; right: 30px; top: 50px;" /-->
    </div>
  </div>
</template>

<script>
import topbar from 'layouts/topbar.vue'
import leftbar from 'layouts/leftbar.vue'
// import localeChanger from 'components/localeChanger'

export default {
  components: {
    // localeChanger,
    topbar,
    leftbar
  },
  data () {
    return {
    }
  },
  computed: {
    appContentHeight () {
      return `height: calc(100% - ${this.$bus.topbarHeight}px);`
    }
  },
  mounted () {
    this.listenGlobalKeyEvent()
  },
  methods: {
    // 全局监听按键按下状态
    listenGlobalKeyEvent () {
      const listener = {
        16: 'shift',
        17: 'ctrl'
      }
      const setKeyStatus = (keyCode, status) => {
        const keyName = listener[keyCode]
        // 只监听listener中的按键代码
        if (!keyName) return
        const getStatus = () => this.$bus.keys[keyName] === status
        const setStatus = () => { this.$bus.keys[keyName] = status }

        if (!getStatus()) setStatus()
      }
      window.onkeydown = e => setKeyStatus(e.keyCode, true)
      window.onkeyup = e => setKeyStatus(e.keyCode, false)
    }
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
  overflow: hidden;
}
</style>
