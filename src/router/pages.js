import Home from 'views/Home.vue'
import About from 'views/About.vue'

export default [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // 懒加载
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]
