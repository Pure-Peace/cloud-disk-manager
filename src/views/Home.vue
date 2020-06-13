<template>
  <div style="text-align: center;">
    ok sir
  </div>
</template>

<script>
const ipc = require('electron').ipcRenderer
export default {
  data () {
    return {

    }
  },
  methods: {
    openDialogByRemote () {
      const { dialog } = require('electron').remote
      dialog.showMessageBox({ title: '你好', message: '来自主进程的消息：', detail: '我是来自主进程的dialog，使用remote过来的！', type: 'info' })
    },
    openDialogByIpc () {
      ipc.send('showDialog', `<${this.$t('a message')}>`)
    }
  }

}
</script>

<style>
.home-button {
  background-color: #263238;
  opacity: 1;
  border-radius: 4px;
  cursor: pointer;
  height: 45px;
  width: 150px;
  margin: 10px 10px;
  text-align: center;
  line-height: 45px;
}
</style>
