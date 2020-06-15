import { app } from 'electron'

class AppEvents {
  constructor () {
    this.development = process.env.NODE_ENV !== 'production'
  }

  create (appManager) {
    // 窗口管理器
    const windowManager = appManager.windowManager

    app.on('activate', () => {
      if (windowManager.mainWindow.win === null) {

      }
    })

    // 重要！初始化程序
    app.on('ready', async () => {
      appManager.initApp()
    })

    // app退出之前
    app.on('before-quit', () => {
      appManager.tray.destroy()
    })

    // 所有窗口都被关闭
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        windowManager.mainWindow.win = null

        // 设置app托盘菜单 / Set the app tray
        appManager.tray.setToolTip('窗口被关闭了！\nWindow is closed!')
        appManager.tray.displayBalloon({
          title: '嗨~',
          content: '我在这里哦，并没有退出',
          noSound: true
        })
      }
    })

    // 处于开发环境下，保存主进程文件（mainProcess.js）时会自动重载，这里可以加快重载过程
    // with the development environment, when you save the main process file (mainProcess.js),
    // it will be automatically reloaded. This can speed up the reloading process.
    if (this.development) {
      if (process.platform === 'win32') {
        process.on('message', data => {
          if (data === 'graceful-exit') {
            app.quit()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
        })
      }
    }
  }
}

export default new AppEvents()
