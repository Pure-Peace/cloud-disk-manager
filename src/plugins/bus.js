const path = require('path')

const install = (Vue, options) => {
  const Bus = new Vue({
    data () {
      return {
        process,
        sep: path.sep,
        set: Vue.set,
        getWindow: Function,
        getSubService: Function,
        appManager: Object,
        // electron dialog
        dialog: Function,
        // electronId id
        electronId: Number,
        // electron window
        win: Object,
        router: options.router,
        appName: 'Cloud Disk Manager',
        topbarHeight: 70,
        leftbarWidth: 80,
        // leftbar menu: top
        leftbarTopMenuItems: [
          {
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
        leftbarBottomMenuItems: [
          {
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
        serviceList: [
          {
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
        scrollBarOptions: {
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
    },
    created () {
      const appManager = this.getAppManager()
      this.appManager = appManager
      this.getSubService = appManager.getSubService
      this.getWindow = appManager.getWindow
      this.win = this.$electron.remote.getCurrentWindow()
      this.electronId = this.win.id
      this.dialog = this.$electron.remote.dialog
    },
    methods: {
      getAppManager () {
        return this.$electron.remote.getGlobal('appManager')
      },
      appGetPath (pathName = 'desktop') {
        return this.$electron.remote.app.getPath(pathName)
      },
      modal (item) {
        this.$modal.show('global-modal', { type: item.modalType })
      },
      changePage (item) {
        this.router.push({ name: item.name })
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
        const options2 = this.scrollBarOptions
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
