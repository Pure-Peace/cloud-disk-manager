import moment from 'moment'
const path = require('path')
const {
  clipboard
} = require('electron')

const install = (Vue, options) => {
  const Bus = new Vue({
    data () {
      return {
        process,
        clipboard, // electron clipboard object
        keys: {},
        sep: path.sep,
        set: Vue.set,
        isFocus: false,
        isBlur: false,
        getWindow: Function,
        getSubService: Function,
        appManager: Object,
        dialog: Function, // electron dialog
        electronId: Number, // electron id
        win: Object, // this electron window
        router: options.router,
        appName: 'Cloud Disk Manager',
        topbarHeight: 70,
        leftbarWidth: 80,
        // leftbar menu: top
        leftbarTopMenuItems: [{
          icon: 'dir',
          name: 'Dir',
          handle: this.changePage
        },
        {
          icon: 'cloud-outline',
          name: 'Home',
          handle: this.changePage
        },
        {
          icon: 'list',
          name: 'Tasks',
          handle: this.changePage
        }
        ],
        // leftbar menu: bottom
        leftbarBottomMenuItems: [{
          icon: 'setting',
          name: 'Settings',
          handle: this.changePage
        },
        {
          icon: 'info',
          name: 'About',
          handle: this.modal,
          modalType: 'appAbout'
        }
        ],
        serviceList: [{
          name: 'ftp',
          title: 'FTP'
        },
        {
          name: 'smb',
          title: 'SMB'
        },
        {
          name: 'baiduyun',
          title: '百度网盘'
        }
        ],
        scrollBarOptions: () => {
          return {
            vuescroll: {
              detectResize: true
            },
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
          }
        }
      }
    },
    created () {
      this.objectsInitial()
      this.eventsInitial()
    },
    methods: {
      objectsInitial () {
        const appManager = this.getAppManager()
        this.appManager = appManager
        this.getSubService = appManager.getSubService
        this.getWindow = appManager.getWindow
        this.win = this.$electron.remote.getCurrentWindow()
        this.electronId = this.win.id
        this.dialog = this.$electron.remote.dialog
      },
      eventsInitial () {
        this.win.on('blur', () => {
          this.isBlur = true
          this.isFocus = false
          this.keys = {}
        })
        this.win.on('focus', () => {
          this.isFocus = true
          this.isBlur = false
        })
      },
      // 子服务处理器，高cpu、高io的操作丢给子服务，有效防止渲染进程阻塞！
      chokidarHandler (channel, data) {
        return new Promise(resolve => {
          const start = Date.now()
          // 获取子服务窗口id（子服务以第二个渲染进程的形式存在）
          const subServiceId = this.getSubService('chokidarService').win.id
          // 生成一个事件唯一id
          const eventId = this.$md5(
            Date.now() + this.win.id + subServiceId + channel
          )
          // 发送处理
          this.$electron.ipcRenderer.sendTo(
            subServiceId,
            channel,
            Object.assign({
              eventId
            }, data)
          )
          // 等待处理完成
          this.$electron.ipcRenderer.once(eventId, (e, arg) => {
            console.log(
              `chokidarHandler event: ${eventId} resolved, time spent: ${Date.now() -
              start}ms`
            )
            resolve(arg)
          })
        })
      },
      sizeFormat (size, units, digits = 2) {
        /**
         * @param {Number} size
         * @param {Array} [units=['B', 'KB', 'MB', 'GB', 'TB']]
         * @param {Number} [digits=2]
         */
        let unit
        units = units || ['B', 'KB', 'MB', 'GB', 'TB']
        while ((unit = units.shift()) && size > 1024) {
          size /= 1024
        }
        return (unit === 'B' ? size : size.toFixed(!digits ? 2 : digits)) + ' ' + unit
      },
      timeFormat (time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss')
      },
      getAppManager () {
        return this.$electron.remote.getGlobal('appManager')
      },
      appGetPath (pathName = 'desktop') {
        return this.$electron.remote.app.getPath(pathName)
      },
      modal (item) {
        this.$modal.show('global-modal', {
          type: item.modalType
        })
      },
      changePage (item) {
        this.router.push({
          name: item.name
        })
      },
      emit (event, ...args) {
        this.$emit(event, ...args)
      },
      on (event, callback) {
        this.$on(event, callback)
      },
      off (event, callback) {
        this.$off(event, callback)
      },
      mixinScrollBarOptions (options) {
        options = options || {}
        const options2 = this.scrollBarOptions()
        if (options && Object.keys(options).length > 0) {
          for (const key1 in options) {
            for (const key2 in options2) {
              if (key2 === key1) {
                options2[key2] = Object.assign(options2[key2], options[key1])
                delete (options[key1])
                break
              }
            }
          }
        }
        Object.assign(options2, options)
        return options2
      }
    }
  })
  Vue.prototype.$bus = Bus
}

export default install
