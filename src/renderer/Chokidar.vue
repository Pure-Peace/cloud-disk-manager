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
import File from 'components/file.js'

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
      clients: {},
      handlers: [
        {
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
          event: 'initWatcher',
          echoEvents: ['watcherInitialing', 'watcherReady', 'watcherError', 'initialerror'],
          handler: (e, arg) => {
            try {
              const events = arg.events || []
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

              events.forEach(event => {
                watcher.on(event, (...args) => {
                  this.eventTrigged += 1
                  e.echo(`watchEvent:${event}`, args)
                })
              })

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
          event: 'listDir',
          handler: async (e, arg) => {
            const dirPath = arg.dirPath
            const initialFile = (path) => new File(path)
            const fileList = await Promise.all(
              fs.readdirSync(dirPath).map(
                async (fileName) => await initialFile(PATH.join(dirPath, fileName))
              )
            )
            e.echo(arg.flag, { fileList })
          }
        },
        {
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
          event: 'addWatch',
          echoEvent: 'watchAdded',
          handler: (e, arg) => {
            e.watcher.add(arg.target)
            e.echo('watchAdded', arg.event)
          }
        },
        {
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
    statusColor () {
      return `color: ${this.status === 'RUNNING' ? 'green' : 'red'};`
    }
  },
  created () {
    this.initService()
  },
  methods: {
    setClient (id, key, value) {
      if (!this.clients[id]) {
        log(`create client ${id}`)
        this.clients[id] = {}
      }

      this.clients[id][key] = value
    },
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
    initEvents () {
      this.handlers.forEach(item => this.addEvent(

        item.event, (e, arg) => {
          this.totalRecived += 1
          const id = e.senderId
          log(`%c#${this.totalRecived}: recived a message from client(#${id}), channel: ${item.event}, content:`, 'color: blue; font-weight: bold;', arg)
          if (!this.clients[id]) this.clients[id] = { watcher: null, ready: false }
          const that = this

          try {
            item.handler({
              echo: (channel, data) => { this.sendTo(id, channel, data) },
              setClient: (key, value) => { this.setClient(id, key, value) },
              clearClient: () => { this.clients[id] = {} },
              get client () { return that.clients[id] },
              get watcher () { return that.clients[id].watcher },
              senderId: id
            }, arg)
          } catch (e) {
            this.totalError += 1
            throw new Error(e)
          }
        })
      )
    },
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
