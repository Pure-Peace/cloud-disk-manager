const install = (Vue) => {
  const Bus = new Vue({
    data () {
      return {
        appName: 'Cloud Disk Manager',
        topbarHeight: 70,
        leftbarWidth: 80
      }
    },
    methods: {
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
