// vue and plugins
import Vue from 'vue'
import App from 'renderer/App.vue'
import VueBus from 'plugins/bus'
import router from 'renderer/router'
import store from 'renderer/store'
import i18n from 'plugins/i18n'
import vuescroll from 'renderer/plugins/vuescroll-native'

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

function initApp () {
  const option = {
    router,
    store,
    i18n,
    render: h => h(App)
  }
  new Vue(option).$mount('#app')
}

Vue.prototype.$electron = require('electron')
Vue.config.productionTip = false
Vue.use(VModal)
Vue.use(vuescroll)
Vue.use(VueBus, { router })
Vue.use(Contextmenu)
Vue.component('svg-icon', SvgIcon)
Vue.prototype.$backend = backend
Vue.prototype.$iconList = iconList
Vue.prototype.$moment = moment

const params = utils.parseUrlSearch(window.location.search)
params && params.subservice ? initSubService() : initApp()
