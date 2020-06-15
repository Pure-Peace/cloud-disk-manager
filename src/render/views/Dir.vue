<template>
  <div>
    <div v-if="chokidarTaskProcessing">
      chokidar service loading...
      <custom-button @click="closeWatcher">
        cancel
      </custom-button>
    </div>
    <div v-else>
      <div>{{ currentLocalDir }}</div>
      <div>{{ currentLocalDirFiles }}</div>
    </div>
  </div>
</template>

<script>
import customButton from 'components/customButton.vue'
import utils from 'plugins/utils'
const fs = require('fs')
const log = utils.log

export default {
  components: {
    customButton
  },
  data () {
    return {
      chokidarTaskProcessing: true,
      chokidarReady: false,
      chokidarStatus: false,
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
    this.currentLocalDir = this.$bus.appGetPath('desktop')
    if (this.firstActivated) { this.firstActivated = false } else {
      this.sendTo(this.chokidarService.win.id, 'test', '')
    }
  },
  created () {
    const chokidarService = this.$bus.getSubService('chokidarService')
    this.chokidarService = chokidarService
    this.addEvent('chokidarStatus', (e, arg) => {
      if (arg === 'RUNNING') this.chokidarStatus = true
      log(`chokidar is ${arg} now!`)
    })
    this.addEvent('chokidarResults', (e, arg) => {
      if (arg.status === 1) this.chokidarTaskProcessing = true
      console.log('chokidarResults:', arg)
    })
    this.addEvent('chokidarTaskProcessComplete', (e, arg) => {
      console.log('chokidarTaskProcessComplete:', arg)
      this.chokidarTaskProcessing = false
    })
  },
  methods: {
    getNewWatcher () {
      if (this.currentLocalDir && this.currentLocalDir !== '') {
        console.log(this.currentLocalDir)
        this.sendTo(this.chokidarService.win.id, 'test', this.currentLocalDir)
      }
    },
    sendTo (electronId, channel, data = '') {
      this.$electron.ipcRenderer.sendTo(electronId, channel, data)
      this.totalSend += 1
      log(`send a message to channel [${channel}](#${electronId})`)
    },
    addEvent (event, handler) {
      this.$electron.ipcRenderer.removeAllListeners(event)
      this.$electron.ipcRenderer.on(event, handler)
      log(`added event [${event}]!`)
    },
    closeWatcher () {
      this.sendTo(this.chokidarService.win.id, 'stopTaskProcess', '')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
