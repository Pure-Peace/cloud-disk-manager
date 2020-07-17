import Home from 'views/Home.vue'
import Settings from 'views/Settings.vue'
import Tasks from 'views/Tasks.vue'
import Dir from 'views/Dir.vue'
import Ftp from 'views/Ftp.vue'

export default [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dir',
    name: 'Dir',
    component: Dir,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/Tasks',
    name: 'Tasks',
    component: Tasks
  },
  {
    path: '/Ftp',
    name: 'Ftp',
    component: Ftp
  }
]
