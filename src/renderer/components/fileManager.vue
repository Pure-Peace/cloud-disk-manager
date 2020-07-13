<template>
  <div class="file-manager-box">
    <div
      ref="filelist"
      class="file-list"
    >
      <div class="file-list-topbar">
        <div
          class="folder-button"
          title="选择目录"
          @click="handleFolderSelect"
        >
          <span style="padding: 0 5px;">
            <svg-icon icon-class="dir" />
          </span>
          <span>目录</span>
        </div>
        <div
          v-if="historys[currentDir] && historys[currentDir].from"
          class="folder-button"
          title="返回"
          @click="handleBackFolder"
        >
          <span style="padding: 0 5px;">
            <svg-icon icon-class="back-folder" />
          </span>
          <span>返回</span>
        </div>
        <div
          v-if="historys[currentDir] && historys[currentDir].to"
          class="folder-button"
          title="前进"
          @click="handleAheadFolder"
        >
          <span style="padding: 0 5px;">
            <svg-icon icon-class="ahead-folder" />
          </span>
          <span>前进</span>
        </div>
        <div
          class="folder-button"
          title="刷新"
          @click="handleRefreshFolder"
        >
          <span style="padding: 0 5px;">
            <svg-icon icon-class="refresh" />
          </span>
        </div>
        <div
          class="file-currentdir"
          :title="currentDir"
        >
          {{ currentDir }}
        </div>
      </div>
      <div class="file-list-box">
        <vue-element-loading
          :active="listingDir"
          spinner="spinner"
          text="加载中..."
          color="#576AD8"
        />
        <vue-scroll
          ref="vueScroll"
          :ops="scrollBarOptions"
          @handle-resize="visibleAeraResize"
          @handle-scroll="visibleAeraScroll"
        >
          <div
            ref="fileListContent"
            class="file-list-content"
          >
            <div
              v-for="(file, idx) in visibleFileList"
              :key="idx"
              :ref="`fileitem${idx}`"
              class="file-item"
              :title="file.path"
              @click="handleFileClick(file, idx)"
              @dblclick="handleDoubleClick(file, idx)"
              @contextmenu.prevent="fileShowContextmenu($event, file, idx)"
            >
              <div class="file-icon-box">
                <svg-icon
                  class="file-icon"
                  :icon-class="file.iconClass"
                />
              </div>
              <div class="file-self-box">
                <div class="file-name">
                  {{ file.name }}
                </div>
                <div class="file-info-box">
                  <div class="file-info">
                    {{ file.type }}
                  </div>
                  <div class="file-info">
                    {{ file.timeTypeFormatted('ctime') }} {{ file.timeFormatted('ctime') }}
                  </div>
                  <div
                    v-if="file.isFile"
                    class="file-info"
                  >
                    {{ file.sizeFormatted }}
                  </div>
                  <div
                    v-else
                    class="file-info"
                  >
                    未计算
                  </div>
                </div>
              </div>
            </div>
          </div>
        </vue-scroll>
      </div>
      <drag-resize
        :element="$refs.filelist"
        @resizing="handleResizing"
        @resized="handleResized"
      />
    </div>
    <file-info :file="selectedFile" />
  </div>
</template>

<script>
import dragResize from 'components/dragResize.vue'
import fileInfo from 'components/fileInfo.vue'
import utils from 'components/utils.js'
import VueElementLoading from 'vue-element-loading'
import File from 'components/file.js'

const log = console.log

export default {
  components: {
    dragResize,
    fileInfo,
    VueElementLoading
  },
  props: {
    targetDir: {
      type: String,
      default: ''
    },
    resizeWidth: {
      type: Number,
      default: 4
    }
  },
  data () {
    return {
      utils,
      onCtrl: false,
      onShift: false,
      selectedFile: undefined,
      selectedFileIdx: undefined,
      selectedFilesIdx: [],
      fileList: [],
      visibleCount: 0,
      visibleFileList: [],
      listingDir: false,
      currentDir: this.targetDir,
      scrollBarOptions: this.$bus.mixinScrollBarOptions(),
      historys: {},
      lastScrollTop: 0,
      scrollLength: 0
    }
  },
  watch: {
    // 文件目录变更
    currentDir (currentDir, beforeDir) {
      this.clearSelection()

      // 目录变更历史记录处理，用于前进及后退
      const historysHandler = () => {
        if (beforeDir) {
          if (!this.historys[beforeDir]) this.historys[beforeDir] = { to: currentDir }
          else if (this.historys[beforeDir].from !== currentDir) { this.historys[beforeDir].to = currentDir }

          if (!this.historys[currentDir]) this.historys[currentDir] = { from: beforeDir }
          else if (this.historys[currentDir].to !== beforeDir) { this.historys[currentDir].from = beforeDir }
        }
        log(this.historys, 'dirChangeHistorys')
      }
      historysHandler()
      this.handleRefreshFolder(currentDir)
    },

    // 文件列表变更
    fileList (fileList) {
      // 将文件内容区的最小高度设置为数据完全加载后的高度
      // 由于实际上列表数据是懒加载的，这样做可以使得滚动条的比例完整，让人一眼看不出来是懒加载
      this.$refs.fileListContent.style.minHeight = `${this.fileList.length * 65}px`
      this.visibleFileList = this.fileList.slice(0, this.visibleCount)
    },

    // 当前文件内容区可视文件数量变更
    visibleCount (visibleCount) {
      this.visibleFileList = this.fileList.slice(0, visibleCount)
    },

    // 监听总线事件，窗口失去焦点时重置按键状态
    '$bus.isBlur': {
      handler: function (val) {
        if (val) {
          this.onCtrl = false
          this.onShift = false
        }
      }
    }
  },
  mounted () {
    this.watchKeyEvent()
    this.$nextTick(() => {
      // 初始加载2屏的数据
      this.visibleCount = Math.round(this.$refs.vueScroll.$el.clientHeight / 65) * 2
    })
  },
  created () {
    this.initialCurrentDir()
  },
  methods: {
    // 子服务处理器，高cpu、高io的操作丢给子服务，有效防止渲染进程阻塞！
    chokidarHandler (channel, data, subServiceName = 'chokidarService') {
      return new Promise(resolve => {
        const start = Date.now()
        // 获取子服务窗口id（子服务以第二个渲染进程的形式存在）
        const subServiceId = this.$bus.getSubService(subServiceName).win.id
        // 生成一个事件唯一id
        const eventId = this.$md5(Date.now() + this.$bus.win.id + subServiceId + channel)
        // 发送处理
        this.$electron.ipcRenderer.sendTo(subServiceId, channel, Object.assign({ eventId }, data))
        // 等待处理完成
        this.$electron.ipcRenderer.once(eventId, (e, arg) => {
          log(`chokidarHandler event: ${eventId} resolved, time spent: ${Date.now() - start}ms`)
          resolve(arg)
        })
      })
    },

    // 当1屏的大小发生变化时，重新计算1屏的可视数据量
    visibleAeraResize () {
      const resizedVisibleCount = Math.round(this.$refs.vueScroll.$el.clientHeight / 65) * 2
      if (this.visibleCount < resizedVisibleCount) this.visibleCount = resizedVisibleCount
    },

    // 滚动时懒加载
    visibleAeraScroll (vertical) {
      // 滚动累计长度计算
      const scrollLength = vertical.scrollTop - this.lastScrollTop
      this.scrollLength += scrollLength
      this.lastScrollTop = vertical.scrollTop

      // 滚动累计长度大于1屏，且还有数据未加载时继续加载数据
      if (this.scrollLength >= this.$refs.vueScroll.$el.clientHeight &&
        this.visibleFileList.length < this.fileList.length) {
        this.scrollLength -= this.$refs.vueScroll.$el.clientHeight
        // 加载1屏的数据，并附加过度滚动补偿数据
        this.visibleCount += Math.round(this.$refs.vueScroll.$el.clientHeight / 65) + Math.round(this.scrollLength / 65)
      }
    },

    // 刷新当前目录下的文件
    handleRefreshFolder (dir) {
      if (this.listingDir) return
      // 非阻塞列出目录下的文件
      setImmediate(async () => {
        this.fileList = await this.listdir(this.currentDir)
        this.$emit('folderChanged', this.currentDir)
      })
    },

    // 前进到之前的目录（如果有）
    handleAheadFolder () {
      this.currentDir = this.historys[this.currentDir].to
    },

    // 返回到之前的目录（如果有）
    handleBackFolder () {
      this.currentDir = this.historys[this.currentDir].from
    },

    // 文件双击事件
    handleDoubleClick (file, idx) {
      if (file.isDir) this.currentDir = file.path
      log(idx, file, file.name, 'onDoubleClicked')
    },

    // 文件单击事件
    handleFileClick (file, idx) {
      this.handleSelectFile(file, idx)
    },

    // 选择目录，等效于同步方法
    async handleFolderSelect () {
      const selection = await this.$bus.dialog.showOpenDialog(
        this.$bus.win, {
          properties: ['openDirectory', 'showHiddenFiles', 'treatPackageAsDirectory'],
          message: '请选择您要打开的目录'
        }
      )
      if (!selection.canceled && selection.filePaths[0]) this.currentDir = selection.filePaths[0]
    },

    // 清空所有当前文件选择
    clearSelection () {
      this.selectedFile = undefined
      this.selectedFileIdx = undefined
      this.selectedFilesIdx = []
      this.fileList = []
    },

    // 拖动改变文件信息盒子宽度时禁止滚动事件
    handleResizing () {
      this.scrollBarOptions.bar.disable = true
      this.$refs.vueScroll.$el.style.pointerEvents = 'none'
    },

    // 拖动完成恢复正常状态
    handleResized () {
      this.scrollBarOptions.bar.disable = false
      this.$refs.vueScroll.$el.style.pointerEvents = ''
    },

    // 初始化文件目录，默认为桌面
    initialCurrentDir () {
      setImmediate(() => { if (!this.currentDir) this.currentDir = this.$bus.appGetPath('desktop') })
    },

    // 文件项目右键单击上下文菜单
    fileShowContextmenu (event, file, idx) {
      // 共用菜单项
      const publicMenuItems = [
        {
          label: '复制完整路径',
          onClick: () => {
            this.$bus.clipboard.writeText(file.path)
          }
        },
        {
          label: '复制所在路径',
          onClick: () => {
            this.$bus.clipboard.writeText(file.dir)
          }
        },
        {
          label: `复制${file.isDir ? '目录' : '文件'}名`,
          onClick: () => {
            this.$bus.clipboard.writeText(file.name)
          }
        },
        {
          label: '复制完整信息（JSON）',
          onClick: () => {
            this.$bus.clipboard.writeText(file.getInfo())
          }
        }
      ]

      // 目录类型专属菜单项
      const dirMenuItems = [
        {
          label: '进入目录',
          divided: true,
          onClick: () => {
            this.currentDir = file.path
          }
        }
      ]

      // 文件类型专属菜单项
      const fileMenuItems = [

      ]
      /*
      [        { label: '前进(F)', disabled: true },
        { label: '重新加载(R)', divided: true, icon: 'el-icon-refresh' },
        { label: '另存为(A)...' },
        { label: '打印(P)...', icon: 'el-icon-printer' },
        { label: '投射(C)...', divided: true },
        {
          label: '使用网页翻译(T)',
          divided: true,
          minWidth: 0,
          children: [{ label: '翻译成简体中文' }, { label: '翻译成繁体中文' }]
        },
        {
          label: '截取网页(R)',
          minWidth: 0,
          children: [
            {
              label: '截取可视化区域',
              onClick: () => {
                this.message = '截取可视化区域'
                console.log('截取可视化区域')
              }
            },
            { label: '截取全屏' }
          ]
        },
        { label: '查看网页源代码(V)', icon: 'dir' },
        { label: '检查(N)' }]
        */

      // 设置菜单
      this.$contextmenu({
        items: [...(file.isDir ? dirMenuItems : fileMenuItems), ...publicMenuItems],
        event,
        zIndex: 3,
        minWidth: 230,
        el: this.$refs[`fileitem${idx}`][0]
      })
    },

    // 非阻塞列出目录下所有文件及信息
    async listdir (dirPath) {
      this.listingDir = true
      try {
        log(`listing directory [${dirPath}]...`)
        const start = Date.now()

        // 异步非阻塞取出目标目录下所有文件，并获取所有文件的详细信息，等待全部完成后返回
        let { fileList } = await this.chokidarHandler('listDir', { dirPath })
        // 由于上述过程完成的结果是通过ipc通信发送的，所以对象的方法将会丢失，因此在这里重建我们File类的方法
        fileList = fileList.map(file => new File(file))

        log(`directory listing completed. file total: ${fileList.length}, time spent: ${Date.now() - start}ms`)
        this.listingDir = false
        return fileList
      } catch (err) {
        log(`failed when listing directory [${dirPath}]`)
        this.listingDir = false
        throw new Error(err)
      }
    },

    // 选择文件处理
    handleSelectFile (file, idx) {
      // 选中
      const select = (multiple) => {
        this.selectedFileIdx = idx
        this.selectedFile = file
        if (multiple) this.selectedFilesIdx.push(idx)
        else this.selectedFilesIdx = [idx]
        target.className += ' file-selected'
        this.$emit('fileSelected', file, idx)
        log(idx, file, file.name, 'selected')
      }

      // 取消选择
      const unselect = () => {
        this.selectedFileIdx = null
        const idxInselectedFiles = this.selectedFilesIdx.indexOf(idx)
        this.selectedFilesIdx.splice(idxInselectedFiles, 1)
        this.selectedFile = this.fileList[this.selectedFilesIdx[idxInselectedFiles - 1]]
        target.className = target.className.replace(' file-selected', '')
        this.$emit('fileUnselected', file, idx)
        log(idx, file, file.name, 'unselected')
      }

      // 取消选择所有
      const unselectAll = () => {
        this.selectedFilesIdx.forEach(fileIdx => {
          const target = this.$refs[`fileitem${fileIdx}`][0]
          target.className = target.className.replace(' file-selected', '')
        })
      }

      // 获取节点及选中状态
      const target = this.$refs[`fileitem${idx}`][0]
      const selected = this.selectedFilesIdx.includes(idx)
      // 按住ctrl进行多选处理
      if (this.onCtrl) {
        if (selected) unselect()
        else select(true)
      } else {
        // 单选处理
        if (!selected) {
          unselectAll()
          select()
        }
      }
    },

    // 监听按键按下状态
    watchKeyEvent () {
      const setKeyStatus = (keyCode, status) => {
        switch (keyCode) {
          case 16:
            if (this.onShfit === status) return
            this.onShfit = status
            break
          case 17:
            if (this.onCtrl === status) return
            this.onCtrl = status
            break
        }
      }
      document.onkeydown = (e) => setKeyStatus(e.keyCode, true)
      document.onkeyup = (e) => setKeyStatus(e.keyCode, false)
    }
  }
}
</script>

<style lang="less" scoped>
@import "../themes/light.less";
.folder-button {
  white-space: nowrap;
  background-color: #F1F2F6;
  padding: 5px 8px;
  border-radius: 4px;
  transition: .2s ease;
  margin-left: 10px;
  cursor: pointer;
}

.folder-button:hover {
  filter: brightness(.9);
}

.folder-button:active {
  filter: brightness(.8);
}

.file-list-box {
  overflow: hidden;
  display: flex;
  position: relative;
}

.file-list-topbar {
  padding: 0 5px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #d5d8e3;
  height: 55px;
  min-height: 55px;
  font-size: 12px;
  color: #616161;
  //box-shadow: 0 0px 4px rgba(55, 55, 77, 0.1);

}

.file-currentdir {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-left: 8px;
  padding: 5px 15px;
  border-radius: 4px;
  background-color: #F1F2F6;
}

.file-manager-box {
  height: 100%;
  display: flex;
}

.file-list {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 70%;
  height: 100%;
  max-width: 100%;
  min-width: 80px;
}

.file-list:hover .__bar-is-vertical {
  display: none !important;
}

.file-list-content {
  background-color: transparent;
}

.file-item {
  overflow: hidden;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  padding: 6px 10px;
  align-items: center;
  border-bottom: 1px dashed #F1F2F6;
}

.file-item:hover {
  background-color: #e1f0ff;
}

.file-self-box {
  padding: 0 10px;
}

.file-icon-box {
  min-height: 2rem;
  min-width: 2rem;
  height: 2rem;
  width: 2rem;
}

.file-icon {
  height: 100% !important;
  width: 100% !important;
}

.file-name {
  font-size: 13px;
  font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif;
  line-height: 22px;
  padding: 0 5px;

}

.file-selected {
  color: #000000 !important;
  background-color: #E4E6F1 !important;
}

.file-info-box {
  padding: 4px;
  display: flex;

  :not(:first-child) {
    margin-left: 10px;
  }
}

.file-info {
  display: flex;
  //color: @white;
  //background-color: @primary;
  font-size: 12px;
  padding: 2px 0;
  border-radius: 4px;
}

.contextmenu-active {
  color: #000000 !important;
  background-color: #D8DAE5 !important;
}

</style>
