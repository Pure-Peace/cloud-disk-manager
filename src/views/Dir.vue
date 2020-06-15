<template>
  <div>
    <div>{{ currentLocalDir }}</div>
    <div>{{ currentLocalDirFiles }}</div>
  </div>
</template>

<script>
const fs = require('fs')

export default {
  data () {
    return {
      firstActivated: true,
      currentLocalDir: ''
    }
  },
  computed: {
    currentLocalDirFiles () {
      return fs.readdirSync(this.currentLocalDir)
    }
  },
  activated () {
    if (this.firstActivated) this.onFirstOpenHandler()
    else this.onOpenHandler()
  },
  created () {
    console.log('start initial Dir page...')
    this.currentLocalDir = this.$bus.appGetPath('desktop')
  },
  methods: {
    onFirstOpenHandler () {
      console.log('fist open')
      this.firstActivated = false
    },
    onOpenHandler () {
      console.log('open')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
