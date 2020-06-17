<template>
  <div>
    <div v-if="!chokidar.ready">
      chokidar service loading...
      <custom-button @click="closeWatcher">
        cancel
      </custom-button>
    </div>
    <div v-else>
      <div>{{ currentDir }}</div>
      <div>{{ dirFiles }}</div>
    </div>
  </div>
</template>

<script>
import customButton from 'components/customButton.vue'
const fs = require('fs')
const log = console.log

export default {
  components: {
    customButton
  },
  data () {
    return {
      currentDir: '',
      dirFiles: [],
      chokidar: {
        serviceName: 'chokidar',
        connected: false,
        ready: true,
        send: Function,
        callbacks: [
          {
            event: 'status',
            handler: (data) => {
              data = data[0]
              this.chokidar.status = data
              if (data.status === 'RUNNING') this.chokidar.connected = true
            }
          },
          {
            event: 'watcherInitialing',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'watcherReady',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'watcherError',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'watcherClosing',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'watcherClosed',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'eventAdded',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'watchAdded',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            event: 'hasWatched',
            handler: (...args) => {
              console.log(args)
            }
          }
        ]
      }
    }
  },
  computed: {

  },
  watch: {
    currentDir () {
      this.getDirFiles()
    }
  },
  activated () {
    this.currentDir = this.$bus.appGetPath('desktop')
    this.initChokidarEvents()
    this.connectChokidar()
    this.getChokidarStatus()
  },
  created () {

  },
  methods: {
    closeWatcher () {

    },
    connectChokidar () {
      log('try to connect chokidar service...')
      try {
        const chokidarService = this.$bus.getSubService('chokidarService')
        if (!chokidarService) throw Error('can not connect to chokidar service!')
        this.chokidar.service = chokidarService
        this.chokidar.send = (channel, data) => {
          this.$electron.ipcRenderer.sendTo(this.chokidar.service.win.id, channel, data = null)
          log(`send a message to chokidar, channel: [${channel}], data:`, data)
        }
        this.chokidar.connected = true
        log('connect to chokidar service success!', this.chokidar)
      } catch (e) {
        this.chokidar.connected = false
        throw new Error(e)
      }
    },
    getChokidarStatus () {
      this.chokidar.send('status')
    },
    getDirFiles () {
      const result = fs.readdirSync(this.currentDir)
      this.dirFiles = result
      return result
    },
    addEvent (event, handler) {
      try {
        this.$electron.ipcRenderer.removeAllListeners(event)
        this.$electron.ipcRenderer.on(event, handler)
        log(`added ipc event [${event}]!`)
      } catch (e) {
        throw new Error(e)
      }
    },
    initChokidarEvents () {
      this.chokidar.callbacks.forEach(item => this.addEvent(
        this.chokidar.serviceName + item.event, (e, ...arg) => {
          log('recived a message from chokidar, content:', arg)
          try {
            item.handler(arg)
          } catch (e) {
            throw new Error(e)
          }
        })
      )
    }
  }
}
</script>

<style lang="less" scoped>

</style>
