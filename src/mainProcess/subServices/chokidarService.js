import { BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import utils from '@/plugins/utils'

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
      if (!process.env.IS_TEST) {
        // 开发环境下自启动开发者工具
        // start developer tools in the development environment
        this.win.webContents.openDevTools({ mode: 'detach' })
      }
    } else {
      createProtocol('app')
      this.win.loadURL('app://./chokidar.html' + subServiceParams)
    }

    this.win.on('closed', () => {
      this.win = null
    })
  }

  createWindow () {
    if (!this.win) {
      this.win = new BrowserWindow({
        width: 1100,
        height: 770,
        minWidth: 1100,
        minHeight: 770,
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
        },
        // eslint-disable-next-line no-undef
        icon: `${__static}/app.ico`,
        frame: false
      })

      // 初始化浏览器页面
      this.initBrowserPage()
    }
  }
}
