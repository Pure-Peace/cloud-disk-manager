<template>
  <div style="padding: 20px 50px;">
    <h1>This is chokidar service!</h1>
    <h2 :style="statusColor">
      Status: {{ status }}
    </h2>
    <h3>createdTime: {{ $moment(createdTime).format('YYYY-MM-DD HH:mm:ss') }}</h3>
    <h3>totalSend: {{ totalSend }}</h3>
    <h3>totalRecived: {{ totalRecived }}</h3>
    <h3>totalError: {{ totalError }}</h3>
    <h3>servicesCompleted: {{ servicesCompleted }}</h3>
    <h3>watchedFiles: {{ watchedFiles }}</h3>
    <h3>clients: {{ Object.keys(clients) }}</h3>
    <h3>client counts: {{ Object.keys(clients).length }}</h3>
  </div>
</template>

<script>
import utils from 'plugins/utils'
const chokidar = require('chokidar')
const log = utils.log

export default {
  data () {
    return {
      status: 'STOPPED',
      createdTime: Date.now(),
      totalSend: 0,
      totalRecived: 0,
      totalError: 0,
      servicesCompleted: 0,
      watchedFiles: 0,
      clients: {},
      handlers: [
        {
          event: 'status',
          handler: (e, arg) => {
            this.sendTo(e.senderId, 'chokidarStatus', this.status)
          }
        },
        {
          event: 'test',
          handler: (e, targetDir) => {
            console.log(this.clients)
            if (!targetDir || targetDir === '') targetDir = this.clients[e.senderId].currentDir
            if (!targetDir || targetDir === '') {
              console.log('no dir???')
              return false
            }
            this.clients[e.senderId].currentDir = targetDir
            const watcher = chokidar.watch(targetDir)
              .on('all', (e, path) => {
                this.watchedFiles += 1
                // console.log(e, path)
              })
            this.clients[e.senderId].watcher = watcher
            this.servicesCompleted += 1
            this.sendTo(e.senderId, 'chokidarResults', { targetDir, status: 1, info: 'add watcher complete', watcher })
          }
        },
        {
          event: 'stopTaskProcess',
          handler: (e, _) => {
            console.log('try to stop task processing...', this.clients[e.senderId].watcher)
            this.clients[e.senderId].watcher.close().then(() => {
              console.log('closed!')
              this.sendTo(e.senderId, 'chokidarTaskProcessComplete', '')
            })
          }
        }
      ]
    }
  },
  computed: {
    statusColor () {
      return `color: ${this.status === 'RUNNING' ? 'green' : 'red'};`
    }
  },
  created () {
    log('-----chokidar service-----')
    log('initial chokidar service...')
    this.handlers.forEach(item => this.addEvent(
      item.event, (e, arg) => {
        try {
          log(`#${this.totalRecived}: recived a message from [#${e.senderId}], content [${arg}]`)
          this.totalRecived += 1
          if (!this.clients[e.senderId]) this.clients[e.senderId] = { watcher: undefined, currentDir: undefined }
          // this.sendTo(e.senderId, 'recived')
          item.handler(e, arg)
        } catch (e) {
          this.totalError += 1
          throw new Error(e)
        }
      })
    )
    this.createdTime = Date.now()
    this.status = 'RUNNING'
    log('chokidar service is ready!')
  },
  methods: {
    sendTo (electronId, channel, data = 'recived') {
      try {
        this.$electron.ipcRenderer.sendTo(electronId, channel, data)
        this.totalSend += 1
        log(`#${this.totalSend}: send a message to channel [${channel}](#${electronId})`)
      } catch (e) {
        this.totalError += 1
        throw new Error(e)
      }
    },
    addEvent (event, handler) {
      try {
        this.$electron.ipcRenderer.removeAllListeners(event)
        this.$electron.ipcRenderer.on(event, handler)
        log(`added event [${event}]!`)
      } catch (e) {
        this.totalError += 1
        throw new Error(e)
      }
    }
  }
}
</script>
