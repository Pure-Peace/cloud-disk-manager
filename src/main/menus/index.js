import { app, Menu, dialog } from 'electron'

class MenuManager {
  constructor (appManager) {
    this.appManager = appManager
    this.windowManager = appManager.windowManager
    this.translator = appManager.translator
  }

  // 程序托盘菜单
  AppTrayMenu () {
    // 翻译器函数
    // Translator function
    const $t = this.translator.get()

    const template = [
      {
        key: '1',
        label: $t('trayMenu.reset'), // 支持多国语言 / support multi-languauge
        click: () => {
          if (!this.windowManager.mainWindow.win) {
            this.windowManager.mainWindow.createWindow()
          }

          // 执行electron窗口对象方法 / Execute electron window object method
          this.windowManager.mainWindow.win.restore()
          this.windowManager.mainWindow.win.moveTop()
        }
      },
      {
        key: '2',
        label: $t('trayMenu.openLink'),
        click: () => {
          const { shell } = require('electron')
          shell.openExternal('https://www.electronjs.org/docs')
        }
      },
      {
        key: '3',
        label: $t('trayMenu.openDialog'),
        click: () => {
          dialog.showMessageBox({ type: 'info', title: $t('trayMenu.dialog.title'), message: $t('trayMenu.dialog.message'), detail: $t('trayMenu.dialog.detail') })
        }
      },
      { key: '4', label: $t('trayMenu.exit'), click: () => { app.exit() } }
    ]
    return Menu.buildFromTemplate(template)
  }
}

export default MenuManager
