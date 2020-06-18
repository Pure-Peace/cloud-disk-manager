
<template>
  <div style="height: 100%;">
    <div class="file-list-box">
      <div
        ref="fileList"
        class="file-list"
        @mouseenter="showBar"
        @mouseleave="hideBar"
      >
        <div
          class="file-list-topbar"
        >
          {{ currentDir }}
        </div>
        <vue-scroll
          ref="vueScroll"
          :ops="scrollBarOps"
        >
          <div
            v-for="(file, idx) in dirFiles"
            :key="idx"
            :style="fileSelectedStyle(idx)"
            class="file-content"

            @click="selectFile(file, idx)"
          >
            <span
              class="file-name"
            >{{ file }}</span>
          </div>

          <div
            class="drag-resize"
            @mousedown="dragResize"
          />
        </vue-scroll>
      </div>
    </div>
  </div>
</template>

<script>
// import customButton from 'components/customButton.vue'
const fs = require('fs')
const log = console.log

export default {
  components: {
  },
  data () {
    return {
      currentSelected: -1,
      selectedFiles: [],
      scrollBarOps: {
        scrollPanel: {
          scrollingX: false,
          scrollingY: true,
          speed: 0,
          verticalNativeBarPos: 'right'
        },
        bar: {
          background: '#000000',
          opacity: 0.3,
          specifyBorderRadius: '0px',
          size: '10px',
          showDelay: 500,
          keepShow: false,
          disable: false
        },
        rail: {
          size: '10px',
          specifyBorderRadius: '0px',
          gutterOfEnds: null,
          gutterOfSide: '4px',
          keepShow: false
        }
      },
      resizeWidth: 4,
      currentDir: '',
      dirFiles: [],
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
  computed: {
    fileSelectedStyle () {
      return (idx) => {
        return this.currentSelected === idx ? 'background-color: red;' : ''
      }
    },
    fileContentClass () {
      return (idx) => {
        let theStyle = 'file-content'
        if (this.selectedFiles.includes(idx)) theStyle += ' file-selected '
        return theStyle
      }
    }
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
    this.initWatcher()
  },
  created () {},
  methods: {
    selectFile (file, idx) {
      log(file, idx, 'selected')
      this.selectedFiles = [idx]
      this.currentSelected = idx
    },
    showBar () {
      this.$refs.vueScroll.showBar()
      this.$refs.vueScroll.vuescroll.state.dontHide = true
    },
    hideBar () {
      this.$refs.vueScroll.vuescroll.state.dontHide = false
      this.$refs.vueScroll.hideBar()
    },
    dragResize (e) {
      const clearEvents = e => {
        document.onmouseup = undefined
        document.onmousemove = undefined
        document.onmouseup = undefined
        document.onmouseout = undefined
        document.body.style.cursor = 'auto'
        this.scrollBarOps.bar.disable = false
      }
      const stopDrag = e => clearEvents(e)
      const initDragEvents = e => {
        document.onmouseleave = () => stopDrag(e)
        document.onmouseup = e => stopDrag(e)
        document.onmousemove = e => {
          const width = this.$refs.fileList.clientWidth
          this.$refs.fileList.style.width = width + e.movementX + 'px'
        }
      }
      this.scrollBarOps.bar.disable = true
      document.body.style.cursor = 'ew-resize'
      initDragEvents(e)
    },
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

<style lang="less" scoped>
.file-list-topbar {
  padding: 0 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #f1f2f6;
  height: 35px;
  font-size: 12px;
  color: #616161;
  box-shadow: 0 1px 1px rgba(50, 50, 93, 0.1);
}

.file-list-box {
  height: 100%;
}

.file-list {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  max-width: 100%;
  min-width: 80px;
  background-color: #F3F3F3;
}

.drag-resize {
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
}

.file-list:hover .__bar-is-vertical {
  display: none !important;
}

.file-content {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 22px;
  cursor: pointer;
  padding: 0 10px;
}

.file-content:hover {
  background-color: #DEDEDE;
}

.file-name {
  font-size: 13px;
  font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif;
  line-height: 22px;
  color: #616161;
  padding: 0 5px;
}

.file-selected {
  background-color: red;
}
</style>
