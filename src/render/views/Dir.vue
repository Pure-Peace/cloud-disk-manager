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
      chokidarService: Object,
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
    this.sendTo(this.chokidarService.win.id, 'status', 'hello')

    if (this.firstActivated) { this.firstActivated = false } else {

    }
  },
  created () {
    this.currentLocalDir = this.$bus.appGetPath('desktop')
    const chokidarService = this.$bus.getSubService('chokidarService')
    this.chokidarService = chokidarService
  },
  methods: {
    getNewWatcher () {
      this.watcher = chokidar.watch(this.currentLocalDir, { depth: 0 })
        .on('all', (e, path) => {
          // log(e, path)
        })
    },
    sendTo (electronId, channel, data = 'hello') {
      this.$electron.ipcRenderer.sendTo(electronId, channel, data)
      this.totalSend += 1
      log(`#${this.totalSend}: send a message to channel [${channel}](#${electronId})`)
    },
    addEvent (event, handler) {
      this.$electron.ipcRenderer.removeAllListeners(event)
      this.$electron.ipcRenderer.on(event, handler)
      log(`added event [${event}]!`)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
