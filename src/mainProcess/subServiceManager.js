import ChokidarService from './subservices/chokidarService'

class subServiceManager {
  constructor () {
    this.chokidarService = new ChokidarService()
  }

  // 创建所有窗口
  createAll () {
    this.chokidarService.createWindow()
  }
}
export default subServiceManager
