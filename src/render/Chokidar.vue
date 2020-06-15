<template>
  <div>this is chokidar service!</div>
</template>

<script>
import utils from 'plugins/utils'
const log = utils.log

export default {
  data () {
    return {
      createdTime: Date.now(),
      totalSend: 0,
      totalRecived: 0,
      totalError: 0,
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
