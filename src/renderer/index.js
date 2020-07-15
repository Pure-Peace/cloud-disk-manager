// vue and plugins
import Vue from 'vue'
import App from 'renderer/App.vue'
import VueBus from 'plugins/bus'
import router from 'renderer/router'
import store from 'renderer/store'
import i18n from 'plugins/i18n'
import vuescroll from 'renderer/plugins/vuescroll-native'
import md5 from 'js-md5'

// subservice components
import Chokidar from 'renderer/Chokidar.vue'

// components, custom plugins
import VModal from 'vue-js-modal'
import moment from 'moment'
import utils from 'plugins/utils'
import backend from 'backend/resources'
import Contextmenu from 'components/contextmenu/'
import SvgIcon from 'components/svgIcon/index.vue'
import iconList from 'components/svgIcon'

// theme styles
import 'themes/global.less'
import 'themes/light.less'

// subservice
const subservices = {
  Chokidar
}

// 初始化子服务方法
function initSubService () {
  try {
    const vueComponent = subservices[params.service]
    if (!vueComponent) throw new Error(`Please import this vueComponent: ${params.service}`)
    const option = {
      store,
      render: h => h(vueComponent)
    }
    new Vue(option).$mount(`#${params.elementId}`)
  } catch (e) {
    throw new Error(e)
  }
}

// 初始化app方法
function initApp () {
  const option = {
    router,
    store,
    i18n,
    render: h => h(App)
  }
  new Vue(option).$mount('#app')
}

// 优先加载
Vue.config.productionTip = false
Vue.prototype.$electron = require('electron')

// use components ------
Vue.use(VModal)
Vue.use(vuescroll)
Vue.use(VueBus, { router })
Vue.use(Contextmenu)
Vue.component('svg-icon', SvgIcon)

// prototype ------
Vue.prototype.$backend = backend
Vue.prototype.$iconList = iconList
Vue.prototype.$moment = moment
Vue.prototype.$md5 = md5

// 根据url解码数据来判断初始化对象是子服务还是app
const params = utils.parseUrlSearch(window.location.search)
params && params.subservice ? initSubService() : initApp()
