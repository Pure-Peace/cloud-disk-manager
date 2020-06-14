const install = (Vue) => {
  const Bus = new Vue({
    data () {
      return {
        appName: 'Cloud Disk Manager',
        topbarHeight: 70,
        leftbarWidth: 80,
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
    methods: {
      modal (self, item) {
        self.$modal.show('global-modal', { type: item.modalType })
      },
      changePage (self, item) {
        self.$router.push({ name: item.name })
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
