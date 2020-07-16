

# Cloud Disk Manager
![logo](https://imgconvert.csdnimg.cn/aHR0cDovL21peWEuaW5rL2Nsb3VkRGlzay9sb2dvLnBuZw?x-oss-process=image/format,png)

## ⭐跨平台的云存储，及本地文件管理器。

🚀基于 `Electron 8` 以及 `vue-cli 3` 构建的跨平台文件管理器。

提供用户对本地以及各类 “云存储” 文件的一站式管理。使得用户能在各类 “云存储” ，不同账号、本地存储之间随意切换，进行文件上传、下载、备份以及其它管理操作。



## 🌼再进一步：


所谓“云存储”，包括常用协议： `FTP`、`SFTP`、`SMB` 在内，延伸到各类网盘服务。

而网盘服务，主要包括：

- 面向中国大陆提供服务的 `百度云`、`天翼云`、`115` 等
- 国外的 `Google Drive` 、 `Amazon Cloud Drive` 等常见网络硬盘服务


## 🍉项目构建：


### 🛠 核心：

- **[Electron](http://www.electronjs.org/)**：主要框架，构建跨平台桌面应用的核心
- **[Vue.js](https://cli.vuejs.org/)**：主要框架，构建用户界面的核心
- **[Vue-CLI](https://cli.vuejs.org/)**：Vue.js 开发的标准工具，方便快速构建比较固定的项目结构
-  **[Electron-builder](https://github.com/electron-userland/electron-builder)**：Electron 项目打包工具


### 🛠 重要：

- **[vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)**：集成了 **Electron-builder** 的 Vue-CLI 插件
- **[eslint](https://github.com/eslint/eslint)**：代码质量管理工具
- **[vue-cli-electron-template](https://github.com/Pure-Peace/vue-cli-electron-template)**：这是我的 **Electron + Vue-CLI** 模板项目，当前项目就是在它的基础上进行开发的


### 🛠 工具：

- **[Vue Router](https://router.vuejs.org/)**：Vue.js 的官方路由器，用于构建单页面应用
- **[Vue I18n](http://kazupon.github.io/vue-i18n/)**：国际化，为应用提供多语言支持
- **[chokidar](https://github.com/paulmillr/chokidar)**：高效的文件、路径监视器，已被许多成熟项目（如 Visual Studio Code、webpack 等）所使用
- **[fs-extra](https://github.com/jprichardson/node-fs-extra)**：Node.js 标准库 **[fs](http://nodejs.cn/api/fs.html)** 的增强版
- **[Iconfont](https://www.iconfont.cn/)**：阿里巴巴矢量图标库，本项目中大部分 svg 图标的来源
- **[svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader)**：在项目中使用 svg 图标的基础
- **[axios](https://github.com/axios/axios)**：以 Promise 为基础的网络请求器，能够自动根据环境（浏览器 / Node.js）发出不同的网络请求
- **[less.js](https://github.com/less/less.js)**：动态的 css 预处理器
- ...



## 📷运行截图：

![截图](http://miya.ink/cloudDisk/01.png)
![截图](http://miya.ink/cloudDisk/02.png)
![截图](http://miya.ink/cloudDisk/03.png)
![截图](http://miya.ink/cloudDisk/04.png)
![截图](http://miya.ink/cloudDisk/05.png)
![截图](http://miya.ink/cloudDisk/06.png)
![截图](http://miya.ink/cloudDisk/07.png)
![截图](http://miya.ink/cloudDisk/08.png)
![截图](http://miya.ink/cloudDisk/09.png)
![截图](http://miya.ink/cloudDisk/10.png)




## 🍰项目结构：


```javascript
|-- Cloud Disk Manager							// 项目目录
    |-- vue.config.js							// vue及webpack配置
    |-- .github									
    |   |-- workflows							
    |       |-- main.yml						// Github actions 自动打包配置脚本
    |-- dist_electron							// 打包后生成的文件
    |-- public									// 公共静态资源目录
    |-- screenshots								// 截图
    |-- src										
        |-- assets								// 静态资源目录
        |   |-- svg								// 项目所使用的 svg 图标
        |-- backend								// 网络请求器及接口
        |-- locales								// 多语言翻译文件存放目录
        |-- main								// 主进程（后端）
        |   |-- index.js						// 主进程入口文件
        |   |-- events							// 事件注册
        |   |   |-- app							// 主进程 app 事件
        |   |   |-- ipc							// 主进程 ipc 事件
        |   |-- managers						// 管理器
        |   |   |-- appManager.js				// 主进程总管理器
        |   |   |-- subServiceManager.js		// 子服务管理器
        |   |   |-- windowManager.js			// 窗口管理器
        |   |-- menus							// Electron 主进程原生菜单（如：托盘菜单）
        |   |-- plugins							// 主进程插件
        |   |-- subServices						// 子服务目录
        |   |   |-- chokidarService.js			// chokidar 子服务
        |   |-- windows							// 窗口目录
        |       |-- mainWindow.js				// 主窗口
        |-- plugins								// 全局插件
        |   |-- bus.js							// 中央总线（重要）
        |   |-- i18n.js							// 多语言支持
        |   |-- utils.js						
        |-- renderer							// 渲染进程（前端）
            |-- App.vue							// Vue app 前端主页面
            |-- Chokidar.vue					// chokidar 子服务前端页面
            |-- index.js						// Vue 入口文件（渲染进程入口）
            |-- components						// 前端组件
            |   |-- utils.js					
            |   |-- contextmenu					// 自定义右键上下文菜单组件
            |   |-- fileManager					// 文件管理器
            |   |   |-- file.js					// 文件对象，包括文件信息及文件操作处理
            |   |   |-- fileDirPathBar.vue		// 目录地址栏
            |   |   |-- fileInfo.vue			// 文件信息模块
            |   |   |-- fileListItem.vue		// 文件列表项模块
            |   |   |-- fileListTopbar.vue		// 文件列表顶栏
            |   |   |-- fileManager.vue			// 文件管理器主文件
            |   |-- localeChanger				// 语言切换器
            |   |-- modalContents				// 模态框内容
            |   |-- svgIcon						// 封装的 svg 组件
            |-- layouts							// 前端布局
            |   |-- leftbar.vue					// 左侧导航栏
            |   |-- topbar.vue					// 顶栏
            |-- plugins							// 前端插件
            |   |-- vuescroll-native.js			// 自定义虚拟滚动条
            |-- router							// vue router
            |   |-- index.js					
            |   |-- pages.js					// 页面
            |-- store							// vuex
            |-- themes							// 主题样式
            |   |-- global.less					// 自定义全局样式
            |   |-- light.less					// 当前主题（明亮）样式；黑暗主题未制作
            |-- views							// 视图
                |-- Dir.vue						// 文件管理
                |-- Home.vue					// 主页
                |-- Settings.vue				// 设置页面
                |-- Tasks.vue					// 任务页面
```


## 🦄开发调试：


 1. **🍬 克隆项目到本地**
 
```bash
git clone https://github.com/Pure-Peace/cloud-disk-manager
```

 2. **🍮 安装依赖**
 
```bash
cd cloud-disk-manager

npm i
```

中国大陆用户建议使用淘宝镜像加速下载

```bash
npm config set registry 'https://registry.npm.taobao.org'
export ELECTRON_MIRROR='https://npm.taobao.org/mirrors/electron/'
export SASS_BINARY_SITE='https://npm.taobao.org/mirrors/node-sass'
```

 4. **🌽 运行**
 
```bash
npm run go
```

 5. **🍭 打包**
 
```bash
npm run packapp
```

# 开源协议

MIT
