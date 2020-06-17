const install = (Vue, options) => {
  const Bus = new Vue({
    data () {
      return {
        process,
        getWindow: Function,
        getSubService: Function,
        appManager: Object,
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
        ]
      }
    },
    created () {
      const appManager = this.getAppManager()
      this.appManager = appManager
      this.getSubService = appManager.getSubService
      this.getWindow = appManager.getWindow
      this.win = this.$electron.remote.getCurrentWindow()
      this.electronId = this.win.id
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
      }
    }
  })
  Vue.prototype.$bus = Bus
}

export default install
