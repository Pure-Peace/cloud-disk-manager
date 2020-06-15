// vue and plugins
import Vue from 'vue'
import App from 'render/App.vue'
import VueBus from 'plugins/bus'
import router from 'render/router'
import store from 'render/store'
import i18n from 'plugins/i18n'

// subservice components
import Chokidar from 'render/Chokidar.vue'

// custom plugins
import VModal from 'vue-js-modal'
import utils from 'plugins/utils'
import $backend from 'backend/resources'
import SvgIcon from 'components/svgIcon/index.vue'
import 'components/svgIcon'

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
Vue.use(VueBus, { router })
Vue.component('svg-icon', SvgIcon)
Vue.prototype.$backend = $backend

const params = utils.parseUrlSearch(window.location.search)
params && params.subservice ? initSubService() : initApp()
