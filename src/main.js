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

Vue.use(VueBus)
Vue.component('svg-icon', SvgIcon)
Vue.prototype.$backend = $backend
Vue.prototype.$electron = require('electron')
Vue.config.productionTip = false

// Navigation guard (interceptor) , executes code before each jump of the router
// 导航守卫（拦截器），在router每次跳转前执行
router.beforeEach((to, from, next) => {
  // code
  next()
})

// executes code every time a jump is completed
// 在router每次跳转完成后执行
router.afterEach(() => {
  // code
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
