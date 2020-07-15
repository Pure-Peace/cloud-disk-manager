<template>
  <div />
</template>

<script>
// chokidar客户端，我写了一些api的示例备忘（其实真的会忘记）

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
            // 获取chokidar服务状态
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
            // chokidar初始化错误
            event: 'initialerror',
            handler: err => {
              console.error(err)
              this.cantUseChokidar(err)
            }
          },
          {
            // 初始化chokidar的文件watcher
            event: 'watcherInitialing',
            handler: (...args) => {
              this.chokidar.initialing = true
              this.chokidar.ready = false
            }
          },
          {
            // watcher就绪，文件监控可用
            event: 'watcherReady',
            handler: (...args) => {
              this.chokidar.initialing = false
              this.chokidar.ready = true
              this.getChokidarStatus()
            }
          },
          {
            // watcher错误，比如无权限去观察的文件
            event: 'watcherError',
            handler: (...args) => {
              console.error(args)
              this.getChokidarStatus()
            }
          },
          {
            // 开始关闭watcher（如果已观察文件数量较多，关闭会花费比较多时间）
            event: 'watcherClosing',
            handler: (...args) => {
              console.log(args)
            }
          },
          {
            // watcher已经关闭
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
            // watcher已添加事件
            event: 'eventAdded',
            handler: (...args) => {
              console.log(args)
              this.getChokidarStatus()
            }
          },
          {
            // watcher已添加文件观察
            event: 'watchAdded',
            handler: (...args) => {
              console.log(args)
              this.chokidar.send('getWatched')
              this.getChokidarStatus()
            }
          },
          {
            // watcher已经观察
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
    // 初始化watcher
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
    // 关闭watcher
    closeWatcher () {
      if (!this.chokidar.closing) {
        this.chokidar.closing = true
        this.chokidar.closingInterval = setInterval(() => {
          this.chokidar.send('closeWatcher')
        }, 500)
      }
    },
    // 连接到chokidar服务
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

    // 获取chokidar状态
    getChokidarStatus () {
      this.chokidar.send('status')
    },

    // 添加ipcrender事件
    addEvent (event, handler) {
      try {
        this.$electron.ipcRenderer.removeAllListeners(event)
        this.$electron.ipcRenderer.on(event, handler)
        log(`added ipc event [${event}]!`)
      } catch (e) {
        throw new Error(e)
      }
    },

    // 初始化所有事件
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

    // 无法使用chokidar
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
