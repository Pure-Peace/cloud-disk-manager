import MainWindow from '../windows/mainWindow'

class WindowManager {
  constructor () {
    this.mainWindow = new MainWindow()
  }

  // 创建所有窗口
  createAll () {
    this.mainWindow.createWindow()
  }
}
export default WindowManager
