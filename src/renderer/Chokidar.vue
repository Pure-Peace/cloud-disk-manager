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
    <h3>eventTrigged: {{ eventTrigged }}</h3>
    <h3>watchedFiles: {{ watchedFiles }}</h3>
    <h3>clients: {{ Object.keys(clients) }}</h3>
    <h3>client counts: {{ Object.keys(clients).length }}</h3>
  </div>
</template>

<script>
// chokidar子服务，基本功能：监测文件修改、列目录、获取文件信息
import File from 'components/fileManager/file.js'

const chokidar = require('chokidar')
const log = console.log

const fs = require('fs-extra')
const PATH = require('path')

export default {
  data () {
    return {
      serviceName: 'chokidar',
      status: 'STOPPED',
      createdTime: Date.now(),
      totalSend: 0,
      totalRecived: 0,
      totalError: 0,
      eventTrigged: 0,
      watchedFiles: 0,
      // 已连接的客户端，每个客户端的watcher独立
      clients: {},
      // handlers是面向客户端的处理器
      handlers: [
        // 非客户端事件处理 ------------------------------
        {
          // 列目录
          event: 'listDir',
          handler: async (e, arg) => {
            const dirPath = arg.dirPath
            const initialFile = (path) => new File(path)
            let error = 0

            try {
              // 无此路径则抛错
              if (!fs.pathExistsSync(dirPath)) throw new Error('no such file or directory')

              // 异步非阻塞取出目标目录下所有文件，并获取所有文件的详细信息，等待全部完成后返回
              const files = fs.readdirSync(dirPath)
              const fileList = await Promise.all(
                files.map(
                  async (fileName) => await initialFile(PATH.join(dirPath, fileName))
                )
              )
              // 发送结果，此处基于发送过来的事件eventId（一个md5）进行回复，而非基于客户端
              e.echo(arg.eventId, { fileList })
            } catch (err) {
              error = 2
              // 错误
              console.warn('listDir error:', err)
              if (err.message.includes('no such file or directory')) error = 1
              e.echo(arg.eventId, { error, message: err.message })
            }
          }
        },
        // 基于客户端的事件处理 ------------------------------
        {
          // 向客户端发送当前状态
          event: 'status',
          echoEvent: 'status',
          handler: (e, arg) => {
            e.echo('status', {
              status: this.status,
              createdTime: this.createdTime,
              totalSend: this.totalSend,
              totalRecived: this.totalRecived,
              totalError: this.totalError,
              eventTrigged: this.eventTrigged,
              watchedFiles: this.watchedFiles,
              apis: this.handlers,
              ...e.client
            })
          }
        },
        {
          // 初始化watcher
          event: 'initWatcher',
          echoEvents: ['watcherInitialing', 'watcherReady', 'watcherError', 'initialerror'],
          handler: (e, arg) => {
            try {
              const events = arg.events || []

              // watcher，遍历深度depth默认为0（当前目录，不往下遍历）
              const watcher = chokidar.watch(arg.target, arg.options || { depth: 0 })
                .on('ready', () => {
                  e.setClient('ready', true)
                  e.setClient('watchedCount', watcher.getWatched().length)
                  e.echo('watcherReady', arg.target)
                })
                .on('error', err => {
                  this.totalError += 1
                  e.echo('watcherError', err)
                })

              // 添加要watch的event
              events.forEach(event => {
                watcher.on(event, (...args) => {
                  this.eventTrigged += 1
                  e.echo(`watchEvent:${event}`, args)
                })
              })

              // 保存watcher
              e.setClient('target', arg.target)
              e.setClient('ready', false)
              e.setClient('watcher', watcher)
              e.echo('watcherInitialing', 'please wait for watcher to initialize')
            } catch (err) {
              e.echo('initialerror', err)
              throw new Error(err)
            }
          }
        },
        {
          // 关闭watcher
          event: 'closeWatcher',
          echoEvents: ['watcherClosing', 'watcherClosed'],
          handler: (e, arg) => {
            try {
              e.watcher.close().then(() => {
                e.echo('watcherClosed', e.client)
                e.clearClient()
              })
              e.echo('watcherClosing', 'please wait for watcher to close')
            } catch (e) {
              throw new Error('already closed')
            }
          }
        },
        {
          // 取消对某文件或目录的watch
          event: 'unwatch',
          echoEvents: ['unwatching', 'unwatched'],
          handler: (e, arg) => {
            e.watcher.unwatch(arg.target).then(() => {
              e.echo('unwatched', arg.target)
            })
            e.echo('unwatching', arg.target)
          }
        },
        {
          // 对watcher添加要watch的事件
          event: 'addEvent',
          echoEvent: 'eventAdded',
          handler: (e, arg) => {
            e.watcher.on(arg.event, (...args) => {
              this.eventTrigged += 1
              e.echo(`watchEvent:${event}`, args)
            })
            e.echo('eventAdded', arg.event)
          }
        },
        {
          // 对watcher添加要watch的文件
          event: 'addWatch',
          echoEvent: 'watchAdded',
          handler: (e, arg) => {
            e.watcher.add(arg.target)
            e.echo('watchAdded', arg.event)
          }
        },
        {
          // 获取已watch的文件
          event: 'getWatched',
          echoEvent: 'hasWatched',
          handler: (e, arg) => {
            e.echo('hasWatched', e.watcher.getWatched())
          }
        }
      ]
    }
  },
  computed: {
    // 运行状态文字的颜色
    statusColor () {
      return `color: ${this.status === 'RUNNING' ? 'green' : 'red'};`
    }
  },
  created () {
    this.initService()
  },
  methods: {
    // 设置保存的客户端数据
    setClient (id, key, value) {
      if (!this.clients[id]) {
        log(`create client ${id}`)
        this.clients[id] = {}
      }

      this.clients[id][key] = value
    },

    // 向客户端发送信息（ipcrenderer)
    sendTo (id, channel, data = 'recived') {
      // channel = this.serviceName + channel
      try {
        this.$electron.ipcRenderer.sendTo(id, channel, data)
        this.totalSend += 1
        log(`%c#${this.totalSend}: send a message to client(#${id}) channel: [${channel}]`, 'color: green; font-weight: bold;')
      } catch (e) {
        this.totalError += 1
        throw new Error(e)
      }
    },

    // 添加ipc事件监听
    addEvent (event, handler) {
      try {
        this.$electron.ipcRenderer.removeAllListeners(event)
        this.$electron.ipcRenderer.on(event, handler)
        log(`added event [${event}]!`)
      } catch (e) {
        this.totalError += 1
        throw new Error(e)
      }
    },

    // 初始化所有eventHandlers
    initEvents () {
      this.handlers.forEach(item => this.addEvent(

        // 当event触发
        item.event, (e, arg) => {
          this.totalRecived += 1
          const id = e.senderId
          log(`%c#${this.totalRecived}: recived a message from client(#${id}), channel: ${item.event}, content:`, 'color: blue; font-weight: bold;', arg)
          if (!this.clients[id]) this.clients[id] = { watcher: null, ready: false }
          const that = this

          // 调用与event对应的handler处理
          try {
            item.handler({
              echo: (channel, data) => { this.sendTo(id, channel, data) }, // 闭包函数，用于对发送消息的客户端进行回复
              setClient: (key, value) => { this.setClient(id, key, value) }, // 闭包函数，用于对发送消息的客户端状态进行设置
              clearClient: () => { this.clients[id] = {} }, // 闭包函数，清除发送消息的客户端
              get client () { return that.clients[id] }, // 发送消息的客户端
              get watcher () { return that.clients[id].watcher }, // 此客户端对应的watcher
              senderId: id // 客户端的窗口（webContents）id
            }, arg)
          } catch (e) {
            this.totalError += 1
            throw new Error(e)
          }
        })
      )
    },
    // 初始化一切！
    initService () {
      log('-----chokidar service-----')
      log('initial chokidar service...')

      this.initEvents()
      this.createdTime = Date.now()
      this.status = 'RUNNING'

      log('chokidar service is ready!')
    }
  }
}
</script>
