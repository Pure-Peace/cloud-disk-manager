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
import utils from 'plugins/utils'
const chokidar = require('chokidar')
const log = utils.log

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
          handler: (e, arg) => {
            e.sendTo('status', {
              status: this.status,
              createdTime: this.createdTime,
              totalSend: this.totalSend,
              totalRecived: this.totalRecived,
              totalError: this.totalError,
              eventTrigged: this.eventTrigged,
              watchedFiles: this.watchedFiles,
              clients: this.clients
            })
          }
        },
        {
          event: 'initWatcher',
          handler: (e, arg) => {
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
              watcher.on(event, () => {
                this.eventTrigged += 1
                e.echo(`event:${event}`, arguments)
              })
            })

            e.setClient('target', arg.target)
            e.setClient('ready', false)
            e.setClient('watcher', watcher)
            e.echo('watcherInitialing', 'please wait for watcher to initialize')
          }
        },
        {
          event: 'closeWatcher',
          handler: (e, arg) => {
            e.watcher().close().then(() => {
              e.clearClient()
              e.echo('watcherClosed', e.client().target)
            })
            e.echo('watcherClosing', 'please wait for watcher to close')
          }
        },
        {
          event: 'unwatch',
          handler: (e, arg) => {
            e.watcher().unwatch(arg.target).then(() => {
              e.echo('unwatched', arg.target)
            })
            e.echo('unwatching', arg.target)
          }
        },
        {
          event: 'addEvent',
          handler: (e, arg) => {
            e.watcher().on(arg.event, () => {
              this.eventTrigged += 1
              e.echo(`event:${event}`, arguments)
            })
            e.echo('eventAdded', arg.event)
          }
        },
        {
          event: 'addWatch',
          handler: (e, arg) => {
            e.watcher().add(arg.target)
            e.echo('watchAdded', arg.event)
          }
        },
        {
          event: 'getWatched',
          handler: (e, arg) => {
            e.echo('hasWatched', e.watcher().getWatched())
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
      channel = this.serviceName + channel
      try {
        this.$electron.ipcRenderer.sendTo(id, channel, data)
        this.totalSend += 1
        log(`#${this.totalSend}: send a message to channel [${channel}](#${id})`)
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

          log(`#${this.totalRecived}: recived a message from [#${id}], content [${arg}]`)
          if (!this.clients[id]) this.clients[id] = { watcher: undefined, ready: false }

          try {
            item.handler({
              echo: (channel, data) => { this.sendTo(id, channel, data) },
              setClient: (key, value) => { this.setClient(id, key, value) },
              clearClient: () => { this.clients[id] = {} },
              client: () => this.clients[id],
              watcher: () => this.clients[id].watcher,
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
