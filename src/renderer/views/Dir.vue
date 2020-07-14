
<template>
  <div style="height: 100%;">
    <file-manager :target-dir="''" />
  </div>
</template>

<script>
import fileManager from 'components/fileManager/fileManager.vue'

export default {
  components: {
    fileManager
  },
  data () {
    return {
      targetDir: ''
    }
  },

  created () {},
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
