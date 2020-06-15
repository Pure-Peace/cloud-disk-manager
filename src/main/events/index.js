import app from './app'
import ipc from './ipc'

class EventManager {
  // 创建app、ipc事件
  constructor (appManager) {
    this.appManager = appManager
    this.init()
  }

  init () {
    app.create(this.appManager)
    ipc.create(this.appManager)
  }
}

export default EventManager
