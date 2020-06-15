<template>
  <div id="app">
    <custom-modal name="global-modal" />
    <topbar ref="topbar" />
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
import customModal from '@/components/customModal.vue'
import topbar from '@/layouts/topbar.vue'
import leftbar from '@/layouts/leftbar.vue'
// import localeChanger from 'components/localeChanger'

export default {
  components: {
    // localeChanger,
    topbar,
    leftbar,
    customModal
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
