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
      currentLocalDir: this.$bus.appGetPath('desktop')
    }
  },
  computed: {
    currentLocalDirFiles () {
      return fs.readdirSync(this.currentLocalDir)
    }
  },
  mounted () {
    console.log()
  }
}
</script>

<style lang="less" scoped>

</style>
