<template>
  <div />
</template>

<script>
const log = console.log

export default {
  data () {
    return {
      chokidar: {
        serviceName: 'chokidar',
        disabled: false,
        connected: false,
        ready: true,
        initialing: false,
        send: Function,
        closingInterval: undefined,
        closing: false,
        cantUseTipShowed: false,
        callbacks: [
          {
            event: 'status',
            handler: data => {
              try {
                data = data[0]
                Object.assign(this.chokidar, data)
                if (data.status === 'RUNNING') this.chokidar.connected = true
                else this.cantUseChokidar()
              } catch (err) {
                this.cantUseChokidar(err)
                throw new Error(err)
              }
            }
          },
          {
            event: 'initialerror',
            handler: err => {
              console.error(err)
              this.cantUseChokidar(err)
            }
          },
          {
            event: 'watcherInitialing',
            handler: (...args) => {
              this.chokidar.initialing = true
              this.chokidar.ready = false
            }
          },
          {
            event: 'watcherReady',
            handler: (...args) => {
              this.chokidar.initialing = false
              this.chokidar.ready = true
              this.getChokidarStatus()
            }
          },
          {
            event: 'watcherError',
            handler: (...args) => {
              console.error(args)
              this.getChokidarStatus()
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
              this.chokidar.closing = false
              clearInterval(this.chokidar.closingInterval)
              this.chokidar.disabled = true
              this.chokidar.ready = false
              this.chokidar.initialing = false
              this.chokidar.connected = false
              this.getChokidarStatus()
            }
          },
          {
            event: 'eventAdded',
            handler: (...args) => {
              console.log(args)
              this.getChokidarStatus()
            }
          },
          {
            event: 'watchAdded',
            handler: (...args) => {
              console.log(args)
              this.chokidar.send('getWatched')
              this.getChokidarStatus()
            }
          },
          {
            event: 'hasWatched',
            handler: (...args) => {
              console.log(args)
              this.chokidar.watched = args
            }
          }
        ]
      }

    }
  },
  created () {
    this.initChokidarEvents()
    this.connectChokidar()
    this.getChokidarStatus()
    this.initWatcher()
  },
  methods: {
    initWatcher (
      data = { events: ['all'], target: this.currentDir, options: undefined }
    ) {
      if (
        !this.chokidar.disabled &&
        !this.chokidar.initialing &&
        !this.chokidar.watcher
      ) {
        if (typeof data !== 'object') throw new Error('data must be an object')
        this.chokidar.initialing = true
        this.chokidar.ready = false
        this.chokidar.send('initWatcher', data)
      }
    },
    closeWatcher () {
      if (!this.chokidar.closing) {
        this.chokidar.closing = true
        this.chokidar.closingInterval = setInterval(() => {
          this.chokidar.send('closeWatcher')
        }, 500)
      }
    },
    connectChokidar () {
      if (!this.chokidar.connected) {
        log('try to connect chokidar service...')
        try {
          const chokidarService = this.$bus.getSubService('chokidarService')
          if (!chokidarService) { throw Error('can not connect to chokidar service!') }
          this.chokidar.service = chokidarService
          this.chokidar.send = (channel, data) => {
            this.$electron.ipcRenderer.sendTo(
              this.chokidar.service.win.id,
              channel,
              data
            )
            log(
              `%csend a message to chokidar, channel: [${channel}], data:`,
              'color: green; font-weight: bold;',
              data
            )
          }
          this.chokidar.connected = true
          log('connect to chokidar service success!', this.chokidar)
        } catch (e) {
          this.chokidar.connected = false
          throw new Error(e)
        }
      }
    },
    getChokidarStatus () {
      this.chokidar.send('status')
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
      const channel = event => this.chokidar.serviceName + event
      this.chokidar.callbacks.forEach(item =>
        this.addEvent(channel(item.event), (e, arg) => {
          log(
            `%crecived a message from chokidar, channel: [${channel(
              item.event
            )}], content:`,
            'color: blue; font-weight: bold;',
            arg
          )
          try {
            item.handler(arg)
          } catch (e) {
            throw new Error(e)
          }
        })
      )
    },
    cantUseChokidar (err = '') {
      this.chokidar.connected = false
      this.chokidar.initialing = false
      this.chokidar.ready = false
      if (!this.cantUseTipShowed) {
        this.cantUseTipShowed = true
        this.$bus.dialog.showMessageBox({
          title: '文件监控系统暂不可用',
          message: '文件监控系统暂不可用：',
          detail: `文件监控系统无法正常工作，您将不能使用监控文件变更的自动备份功能。\n\n${err}`,
          type: err && err !== '' ? 'error' : 'warning'
        })
      }
    }
  }
}
</script>
