import { BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import utils from '@/plugins/utils'

const IS_PROD = true // process.env.NODE_ENV === 'production'

export default class chokidarService {
  constructor (win) {
    // win代表electron窗口实例
    // win is this electron window instance
    this.win = win
  }

  initBrowserPage () {
    const subServiceParams = `?${utils.objectToUrl({ subservice: true, service: 'Chokidar', elementId: 'chokidar' })}`
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      this.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + subServiceParams)
      if (!IS_PROD) {
        // 开发环境下自启动开发者工具
        // start developer tools in the development environment
        this.win.webContents.openDevTools({ mode: 'detach' })
      }
    } else {
      createProtocol('app')
      this.win.loadURL('app://./index.html' + subServiceParams)
    }
  }

  createWindow () {
    if (!this.win) {
      const win = new BrowserWindow({
        width: 460,
        height: 500,
        minWidth: 460,
        minHeight: 500,
        maxWidth: 460,
        maxHeight: 500,
        x: 0,
        y: 0,
        resizable: false,
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
        },
        // eslint-disable-next-line no-undef
        icon: `${__static}/app.ico`,
        frame: true,
        show: !IS_PROD,
        closable: false,
        fullscreenable: false,
        fullscreen: false,
        // skipTaskbar: true,
        alwaysOnTop: true,
        paintWhenInitiallyHidden: false,
        titleBarStyle: 'hiddenInset'
      })

      win.once('ready-to-show', () => {
        win.hide()
      })

      win.on('close', (e) => {
        win.setTitle('Essential services can not be closed! Cloud Disk Manager')
        e.preventDefault()
        e.returnValue = false
        return false
      })

      win.on('closed', () => {
        this.win = null
      })

      this.win = win
      // 初始化浏览器页面
      this.initBrowserPage()
    }
  }
}
