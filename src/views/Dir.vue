<template>
  <div>
    <div>{{ currentLocalDir }}</div>
    <div>{{ currentLocalDirFiles }}</div>
  </div>
</template>

<script>
const fs = require('fs')
const chokidar = require('chokidar')
const log = console.log.bind(console)

export default {
  data () {
    return {
      firstActivated: true,
      currentLocalDir: undefined,
      watcher: undefined
    }
  },
  computed: {
    currentLocalDirFiles () {
      return fs.readdirSync(this.currentLocalDir)
    }
  },
  watch: {
    currentLocalDir: {
      handler: function (current, before) {
        log('change dir', before, ' -> ', current)
        this.getNewWatcher()
      }
    }
  },
  activated () {
    if (this.firstActivated) { this.firstActivated = false } else {

    }
  },
  created () {
    this.currentLocalDir = this.$bus.appGetPath('desktop')
  },
  methods: {
    getNewWatcher () {
      this.watcher = chokidar.watch(this.currentLocalDir, { depth: 0 })
        .on('all', (e, path) => {
          log(e, path)
          log(this.watcher)
        })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
