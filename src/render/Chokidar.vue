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
    <h3>clients: {{ Object.keys(clients) }}</h3>
    <h3>client counts: {{ Object.keys(clients).length }}</h3>
  </div>
</template>

<script>
import utils from 'plugins/utils'
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
      clients: {},
      handlers: [
        {
          event: 'status',
          handler: (e, arg) => {
            // TODO
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
        log(`#${this.totalRecived}: recived a message from [#${e.senderId}], content [${arg}]`)
        this.totalRecived += 1
        // this.sendTo(e.senderId, 'recived')
        item.handler(e, arg)
      })
    )
    this.createdTime = Date.now()
    this.status = 'RUNNING'
    log('chokidar service is ready!')
  },
  methods: {
    sendTo (electronId, channel, data = 'recived') {
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
