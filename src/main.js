// vue入口文件 / vue entry file
import Vue from 'vue'
import VueBus from './plugins/bus'
import App from './App.vue'
import router from './router'
import store from './store'

import VModal from 'vue-js-modal'

import SvgIcon from 'components/svgIcon/index.vue'
import 'components/svgIcon'
import i18n from './i18n'

import $backend from '@/backend/resources'

import '@/themes/global.less'
import '@/themes/light.less'

Vue.use(VModal)
Vue.use(VueBus, { router })

Vue.component('svg-icon', SvgIcon)

Vue.prototype.$backend = $backend
Vue.prototype.$electron = require('electron')

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
