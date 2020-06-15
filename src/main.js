// vue and plugins
import Vue from 'vue'
import App from './App.vue'
import VueBus from './plugins/bus'
import router from './router'
import store from './store'
import i18n from './i18n'

// subservice components
import Chokidar from './Chokidar.vue'

// custom plugins
import utils from './plugins/utils'
import VModal from 'vue-js-modal'
import SvgIcon from 'components/svgIcon/index.vue'
import 'components/svgIcon'
import $backend from '@/backend/resources'

// theme styles
import '@/themes/global.less'
import '@/themes/light.less'

// subservice
const subservices = {
  Chokidar
}

function initSubService () {
  try {
    const vueComponent = subservices[params.service]
    if (!vueComponent) throw new Error(`Please import this vueComponent: ${params.service}`)
    new Vue({
      store,
      render: h => h(vueComponent)
    }).$mount(`#${params.elementId}`)
  } catch (e) {
    throw new Error(e)
  }
}

function initApp () {
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app')
}

Vue.prototype.$electron = require('electron')
Vue.config.productionTip = false
Vue.use(VModal)
Vue.use(VueBus, { router })
Vue.component('svg-icon', SvgIcon)
Vue.prototype.$backend = $backend

const params = utils.parseUrlSearch(window.location.search)
params && params.subservice ? initSubService() : initApp()
