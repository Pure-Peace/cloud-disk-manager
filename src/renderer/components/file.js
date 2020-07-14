import moment from 'moment'
import { iconList } from 'components/svgIcon'

const fs = require('fs-extra')
const PATH = require('path')
const mime = require('mime')
const log = console.log

export default class File {
  constructor (path) {
    if (typeof path === 'object') Object.assign(this, path)
    else {
      // 标记 ----------------
      this.initialed = false
      this.selected = false

      // 信息 ----------------
      this.path = path
      this.name = PATH.basename(path)
      this.dir = PATH.dirname(path)
      this.ext = ''
      this.mime = mime.getType(this.ext)

      try {
        const stats = fs.statSync(path)
        Object.assign(this, stats)

        this.isDir = stats.isDirectory()
        if (!this.isDir) this.ext = PATH.extname(path).replace('.', '')
        else this.ext = ':directory:'
        this.isFile = stats.isFile()
        this.isFIFO = stats.isFIFO()
        this.isSocket = stats.isSocket()
        this.isBlockDevice = stats.isBlockDevice()
        this.isCharacterDevice = stats.isCharacterDevice()
        this.initialed = true
      } catch (err) {
        this.note = '权限不足'
        log(`failed when stat file: ${path},`, new Error(err))
      }
    }
  }

  get type () {
    if (this.isFile) return this.ext === 'lnk' ? '快捷方式' : '文件'
    if (this.isDir) return '目录'
    if (this.isBlockDevice) return '块设备'
    if (this.isCharacterDevice) return '字符设备'
    if (this.isSocket) return '套接字'
    if (this.isFIFO) return 'FIFO'
    return '未知类型'
  }

  get iconClass () {
    const tryIcon = (fileType) => {
      const tryName = fileType
      return iconList.includes(tryName) ? tryName : ''
    }
    const name = this.initialed ? (this.isFile ? 'file' : 'folder') : 'question'
    if (this.isFile && this.ext) return tryIcon(this.ext) || name
    return name
  }

  get sizeFormatted () {
    return this.sizeFormat(this.size)
  }

  get timeTypes () {
    return ['atime', 'ctime', 'mtime', 'birthtime']
  }

  timeTypeFormatted (timeType) {
    const dict = {
      atime: '最后访问',
      ctime: '最后修改',
      mtime: '内容变更',
      birthtime: '创建时间'
    }
    return dict[timeType]
  }

  timeFormatted (timeType) {
    if (!this.timeTypes.includes(timeType)) throw new Error('invalid time type')
    return this.timeFormat(this[timeType])
  }

  // 格式化大小
  sizeFormat (size, units, digits = 2) {
    /**
     * @param {Number} size
     * @param {Array} [units=['B', 'KB', 'MB', 'GB', 'TB']]
     * @param {Number} [digits=2]
     */
    let unit
    units = units || ['B', 'KB', 'MB', 'GB', 'TB']
    while ((unit = units.shift()) && size > 1024) { size /= 1024 }
    return (unit === 'B' ? size : size.toFixed(!digits ? 2 : digits)) + ' ' + unit
  }

  timeFormat (time) {
    return moment(time).format('YYYY-MM-DD HH:mm:ss')
  }

  getInfo (json = true) {
    const { initialed, selected, ...info } = this

    // 目录删除无效信息（如ext和mime属性）
    if (this.isDir) {
      for (const deleteAttr of ['ext', 'mime']) {
        delete (info[deleteAttr])
      }
    }
    return json ? JSON.stringify(info) : JSON.parse(JSON.stringify(info))
  }
}