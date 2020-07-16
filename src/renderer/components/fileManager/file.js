import moment from 'moment'
import {
  iconList
} from 'components/svgIcon'

const fs = require('fs-extra')
const PATH = require('path')
const mime = require('mime')
const {
  remote
} = require('electron')
const log = console.log

let electronWindow
const appManager = remote.getGlobal('appManager')
if (appManager) {
  electronWindow = appManager.windowManager.mainWindow.win
}

export default class File {
  constructor (path) {
    if (typeof path === 'object') Object.assign(this, path)
    else this.initialFile(path)
  }

  // 文件类型字符串，用于信息展示
  get type () {
    if (this.isFile) return this.ext === 'lnk' ? '快捷方式' : '文件'
    if (this.isDir) return '目录'
    if (this.isBlockDevice) return '块设备'
    if (this.isCharacterDevice) return '字符设备'
    if (this.isSocket) return '套接字'
    if (this.isFIFO) return 'FIFO'
    return '未知类型'
  }

  // 按文件类型获取图标
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

  // 时间类型
  get timeTypes () {
    return ['atime', 'ctime', 'mtime', 'birthtime']
  }

  // 初始化
  initialFile (path) {
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
      // 获取文件stats，若无足够权限则会抛错
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
      // 一般就是权限不足，无法获取stats
      this.note = '权限不足'
      log(`failed when stat file: ${path},`, new Error(err))
    }
  }

  // 重命名
  rename (targetName) {
    try {
      const newName = targetName.trim()
      if (!newName) throw new Error('名称不能为空。')

      const newPath = this.dir + (!this.dir.endsWith(PATH.sep) ? PATH.sep : '') + newName
      this.__CHANGEPATH(newPath)
      return true
    } catch (err) {
      this.__SHOWERROR(err, '重命名')
      throw new Error(err)
    }
  }

  // 需要加上文件名的路径
  getNewPath (targetPath) {
    let newPath = targetPath.trim()
    if (!newPath) throw new Error('目标路径不能为空。')

    // 如果未包含文件名，就加上
    if (!targetPath.endsWith(this.name)) newPath += (!this.dir.endsWith(PATH.sep) ? PATH.sep : '') + this.name
    return newPath
  }

  // 移动到
  moveTo (targetPath) {
    try {
      const newPath = this.getNewPath(targetPath)

      this.__CHANGEPATH(newPath)
      return true
    } catch (err) {
      this.__SHOWERROR(err, '移动')
      throw new Error(err)
    }
  }

  // 复制到
  copyTo (targetPath) {
    try {
      const newPath = this.getNewPath(targetPath)

      this.isExists()
      // 判断是否存在重名
      if (fs.pathExistsSync(newPath)) {
        // 对话框结果，如果继续将会进行覆盖，否则会取消操作
        if (this.__CHECKHANDLE('是否要继续操作？', `存在与${this.name}同名的项目，如果继续将会进行覆盖。`)) {
          fs.copySync(this.path, newPath, {
            overwrite: true
          })
        }
      } else {
        fs.copySync(this.path, newPath)
      }
    } catch (err) {
      this.__SHOWERROR(err, '复制')
      throw new Error(err)
    }
  }

  // 删除
  remove () {
    try {
      if (this.isDir) {
        const result = this.__CHECKHANDLE('是否要继续删除？', `您正在删除一整个目录，如果继续，"${this.name}"目录下的所有文件都将会被立即删除，并无法恢复。您要继续删除吗？`)
        if (result) {
          fs.removeSync(this.path)
          this.deleted = true
          return true
        }
      } else {
        const result = this.__CHECKHANDLE('确定要删除项目吗？', `文件将被立即删除，并无法恢复。您确定要删除文件"${this.name}"吗？`)
        if (result) {
          fs.removeSync(this.path)
          this.deleted = true
          return true
        }
      }
    } catch (err) {
      this.__SHOWERROR(err, '删除')
      throw new Error(err)
    }
  }

  // 当前项目是否存在
  isExists (showErr = false) {
    let flag = false
    try {
      // 判断当前项目是否存在
      if (!fs.pathExistsSync(this.path)) {
        this.deleted = true
        flag = true
        throw new Error(`当前${this.isDir ? '目录' : '文件'}已发生变化，不存在于原路径"${this.path}"。`)
      }

      if (this.deleted) this.deleted = false
      return true
    } catch (err) {
      // 如果未能修改到flag标记，说明此函数运行错误
      if (!flag || showErr) this.__SHOWERROR(err, '验证文件存在性')
      throw new Error(err)
    }
  }

  // 时间类型简单解释
  timeTypeFormatted (timeType) {
    const dict = {
      atime: '最后访问',
      ctime: '最后修改',
      mtime: '内容变更',
      birthtime: '创建时间'
    }
    return dict[timeType]
  }

  // 格式化指定类型的时间
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
    while ((unit = units.shift()) && size > 1024) {
      size /= 1024
    }
    return (unit === 'B' ? size : size.toFixed(!digits ? 2 : digits)) + ' ' + unit
  }

  timeFormat (time) {
    return moment(time).format('YYYY-MM-DD HH:mm:ss')
  }

  // 文件转json格式信息输出
  getInfo (json = true) {
    const {
      initialed,
      selected,
      ...info
    } = this

    // 目录删除无效信息（如ext和mime属性）
    if (this.isDir) {
      for (const deleteAttr of ['ext', 'mime']) {
        delete (info[deleteAttr])
      }
    }
    return json ? JSON.stringify(info) : JSON.parse(JSON.stringify(info))
  }

  // 错误信息框
  __SHOWERROR (err, handle = '操作') {
    remote.dialog.showErrorBox(`${handle}时发生错误`, err.message || toString(err) || '未知错误')
  }

  // 需要确认的处理
  __CHECKHANDLE (title, message, type = 'warning') {
    return remote.dialog.showMessageBoxSync(electronWindow, {
      title,
      message,
      type,
      buttons: ['否', '是']
    })
  }

  // 修改路径
  __CHANGEPATH (newPath) {
    // 判断当前项目是否存在
    this.isExists()

    // 新路径是否与旧路径相同？
    if (this.path === newPath) throw new Error(`修改新路径"${newPath}"将与旧路径相同，无法进行此操作。`)

    // 判断是否存在重名
    if (fs.pathExistsSync(newPath)) {
      // 对话框结果，如果继续将会进行覆盖，否则会取消操作
      const result = this.__CHECKHANDLE('是否要继续操作？', '存在同名的项目，如果继续将会进行覆盖。')
      if (!result) throw new Error(`"${newPath}"该路径已存在文件或目录，操作取消。`)
      // 覆盖
      else {
        fs.moveSync(this.path, newPath, {
          overwrite: true
        })
        this.initialFile(newPath)
      }
    } else {
      fs.moveSync(this.path, newPath)
      this.initialFile(newPath)
    }
  }
}
