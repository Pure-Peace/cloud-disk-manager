// 主进程入口文件 / Main process entry file
// 保存此文件时electron将会重启 / Electron will restart when saving this file

'use strict'
import { protocol } from 'electron'

// AppManager负责管理整个app / AppManager is responsible for managing the entire app
import AppManager from './mainProcess/appManager'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

const app = new AppManager()

export default app
