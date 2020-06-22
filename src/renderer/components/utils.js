import Vue from 'vue'

export default new Vue({
  computed: {
    getFileType () {
      return (file) => {
        if (file.isFile) return '文件'
        if (file.isDir) return '目录'
        if (file.isBlockDevice) return '块设备'
        if (file.isCharacterDevice) return '字符设备'
        if (file.isSocket) return '套接字'
        if (file.isFIFO) return 'FIFO'
        return '未知类型'
      }
    },
    timeFormat () {
      return (time) => this.$bus.timeFormat(time)
    },
    sizeFormat () {
      return (size) => this.$bus.sizeFormat(size)
    },
    fileTimes () {
      return (file) => {
        const times = {}
        for (const key in file) { if (['atime', 'ctime', 'mtime', 'birthtime'].includes(key)) times[key] = file[key] }
        return times
      }
    },
    timeTitleFormat () {
      const dict = {
        atime: '最后访问',
        ctime: '文件修改',
        mtime: '内容变更',
        birthtime: '创建于'
      }
      return (title) => {
        return dict[title]
      }
    }
  }
})
