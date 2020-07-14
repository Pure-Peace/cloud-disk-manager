<template>
  <div class="file-manager-box">
    <div
      ref="filelist"
      class="file-list"
    >
      <file-list-topbar
        :dir="currentDir"
        :listing-dir="listingDir"
        @changeDir="(dir)=>{currentDir=dir}"
        @refresh="handleRefreshFolder"
      />
      <div class="file-list-box">
        <vue-loading
          :active="listingDir === 1"
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
            <file-list-item
              v-for="(file, idx) in visibleFileList"
              :key="idx"
              :file="file"
              :show="!(filters[file.ext] && filters[file.ext].status === false)"
              :selected-count="selectedFiles.length"
              @handleSelect="handleSelectFile(file, handle)"
              @fileDoubleClick="handleFileDoubleClick"
              @fileClick="handleFileClick"
            />
            <empty-status
              :show="listingDir === 2 && visibleFileList.length === 0"
              @contextmenu.native="emptyShowContextMenu"
            />
          </div>
        </vue-scroll>
      </div>
      <drag-resize
        :element="$refs.filelist"
        @resizing="handleResizing"
        @resized="handleResized"
      />
    </div>
    <file-info
      :file="selectedFile"
      :file-list="fileList"
      :dir="currentDir"
      @filterChange="(changedFilters)=>{filters = changedFilters}"
      @unselectFile="handleSelectFile(file, 'unselect')"
    />
  </div>
</template>

<script>
import File from 'components/file.js'

// components
import vueLoading from 'vue-element-loading'
import dragResize from 'components/dragResize.vue'
import fileInfo from 'components/fileInfo.vue'
import fileListTopbar from 'components/fileListTopbar.vue'
import emptyStatus from 'components/emptyStatus.vue'
import fileListItem from 'components/fileListItem.vue'

const log = console.log

export default {
  components: {
    dragResize,
    fileInfo,
    vueLoading,
    fileListTopbar,
    emptyStatus,
    fileListItem
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
      onCtrl: false,
      onShift: false,
      selectedFile: null,
      selectedFiles: [],
      fileList: [],
      visibleCount: 10,
      visibleFileList: [],
      listingDir: 0, // 0: 未列目录; 1: 正在列目录; 2: 已列完目录
      filters: {},
      filted: 0,
      currentDir: this.targetDir,
      scrollBarOptions: this.$bus.mixinScrollBarOptions({
        vuescroll: {
          detectResize: true
        },
        bar: {
          background: '#5C617C',
          specifyBorderRadius: '4px',
          size: '8px',
          showDelay: 500
        },
        rail: {
          size: '12px',
          specifyBorderRadius: '4px'
        }
      }),
      lastScrollTop: 0,
      scrollLength: 0
    }
  },

  watch: {
    // 文件目录变更
    currentDir () {
      this.clearSelection()
      this.handleRefreshFolder()
    },

    // 文件列表变更
    fileList (fileList) {
      // 将文件内容区的最小高度设置为数据完全加载后的高度
      // 由于实际上列表数据是懒加载的，这样做可以使得滚动条的比例完整，让人一眼看不出来是懒加载
      this.$refs.fileListContent.style.minHeight = `${this.fileList.length *
        65}px`
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
    },

    filters: {
      deep: true,
      handler: function (filters) {
        if (!this.visibleFileList.length) return
        // 计算过滤掉的文件数量
        const filtedCount = Object.values(filters).reduce((acc, filter) => {
          if (filter.status === false) acc += filter.count
          return acc
        }, 0)
        // 补偿加载文件
        if (filtedCount > this.filted) {
          this.visibleCount += filtedCount - this.filted
          this.filted = filtedCount
        }
        // 重新计算列表滚动高度
        this.$refs.fileListContent.style.minHeight = `${(this.fileList.length -
          filtedCount) *
          65}px`
      }
    }
  },
  mounted () {
    this.watchKeyEvent()
    this.$nextTick(() => {
      // 初始加载2屏的数据
      this.visibleCount =
        Math.round(this.$refs.vueScroll.$el.clientHeight / 65) * 2
    })
  },
  created () {
    this.initialCurrentDir()
  },
  methods: {
    // 当1屏的大小发生变化时，重新计算1屏的可视数据量
    visibleAeraResize () {
      const resizedVisibleCount =
        Math.round(this.$refs.vueScroll.$el.clientHeight / 65) * 2
      if (this.visibleCount < resizedVisibleCount) {
        this.visibleCount = resizedVisibleCount
      }
    },

    // 滚动时懒加载
    visibleAeraScroll (vertical) {
      // 滚动累计长度计算
      const scrollLength = vertical.scrollTop - this.lastScrollTop
      this.scrollLength += scrollLength
      this.lastScrollTop = vertical.scrollTop

      // 滚动累计长度大于1屏，且还有数据未加载时继续加载数据
      if (
        this.scrollLength >= this.$refs.vueScroll.$el.clientHeight &&
        this.visibleFileList.length < this.fileList.length
      ) {
        this.scrollLength -= this.$refs.vueScroll.$el.clientHeight
        // 加载1屏的数据，并附加过度滚动补偿数据
        this.visibleCount +=
          Math.round(this.$refs.vueScroll.$el.clientHeight / 65) +
          Math.round(this.scrollLength / 65)
      }
    },

    // 刷新当前目录下的文件
    handleRefreshFolder () {
      if (this.listingDir === 1) return
      // 非阻塞列出目录下的文件
      setImmediate(async () => {
        this.listdir(this.currentDir)
      })
    },

    // 文件双击事件
    handleFileDoubleClick (file, idx) {
      if (file.isDir) this.currentDir = file.path
      log(idx, file, file.name, 'onDoubleClicked')
    },

    // 文件单击事件
    handleFileClick (file) {
      this.handleSelectFile(file)
    },

    // 清空所有当前文件选择
    clearSelection () {
      this.selectedFile = null
      this.selectedFiles = []
      this.fileList = []
      this.listingDir = 0
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
      setImmediate(() => {
        if (!this.currentDir) this.currentDir = this.$bus.appGetPath('desktop')
      })
    },

    // 空文件列表右键单击上下文菜单
    emptyShowContextMenu (event) {
      // 设置菜单
      this.$contextmenu({
        items: [
          {
            label: '刷新（F5）',
            onClick: () => {
              this.handleRefreshFolder()
            }
          }
        ],
        event,
        zIndex: 3,
        minWidth: 230
      })
    },

    // 非阻塞列出目录下所有文件及信息
    listdir (dirPath) {
      this.listingDir = 1
      try {
        log(`listing directory [${dirPath}]...`)
        const start = Date.now()

        // 异步非阻塞取出目标目录下所有文件，并获取所有文件的详细信息，等待全部完成后返回
        // 由于这是通过子服务chokidarService进行处理的，所以实际上当前进程只需要等待结果即可
        this.$bus.chokidarHandler('listDir', { dirPath }).then(result => {
          // 由于上述过程完成的结果是通过ipc通信发送的，所以对象的方法将会丢失，因此在这里重建我们File类的方法
          const fileList = result.fileList.map(file => new File(file))

          // 完成
          this.fileList = fileList
          this.$emit('folderChanged', { dir: this.currentDir, fileList })
          this.listingDir = 2

          log(
            `directory listing completed. file total: ${
              fileList.length
            }, time spent: ${Date.now() - start}ms`
          )
        })
      } catch (err) {
        log(`failed when listing directory [${dirPath}]`)
        this.listingDir = 2
        throw new Error(err)
      }
    },

    // 选择文件处理
    handleSelectFile (file, handle) {
      // 选中
      const select = multiple => {
        this.selectedFile = file
        if (multiple) this.selectedFiles.push(file)
        else this.selectedFiles = [file]

        file.selected = true
        this.$emit('fileSelected', file)
        log(file, file.name, 'selected')
      }

      // 取消选择
      const unselect = () => {
        const currentFileIndex = this.selectedFiles.findIndex(
          fileInSelected => fileInSelected === file
        )
        if (currentFileIndex === -1) return
        file.selected = false
        this.selectedFiles.splice(currentFileIndex, 1)
        this.selectedFile = this.selectedFiles[currentFileIndex - 1]
        this.$emit('fileUnselected', file)
        log(file, file.name, 'unselected')
      }

      // 取消选择所有
      const unselectAll = () => {
        this.selectedFiles.forEach(fileInSelected => {
          fileInSelected.selected = false
        })
        this.selectedFiles = []
        this.selectedFile = null
      }

      // 获取选中状态
      const selected = file.selected

      // 高优先的命令处理
      switch (handle) {
        case 'unselect':
          unselect()
          return

        case 'addselect':
          select(true)
          return

        case 'unselectAll':
          unselectAll()
          return
      }

      // 按住ctrl进行多选处理
      if (this.onCtrl) {
        if (selected) unselect()
        else select(true)
      } else {
        // 单选处理
        if (!selected) {
          unselectAll()
          select()
        } else {
          this.selectedFile = file
        }
      }
    },

    // 监听按键按下状态
    watchKeyEvent () {
      const setKeyStatus = (keyCode, status) => {
        switch (keyCode) {
          case 16: // shift
            if (this.onShfit === status) return
            this.onShfit = status
            break
          case 17: // ctrl
            if (this.onCtrl === status) return
            this.onCtrl = status
            break
          case 116: // f5
            if (status !== true) return
            this.handleRefreshFolder()
            break
        }
      }
      document.onkeydown = e => setKeyStatus(e.keyCode, true)
      document.onkeyup = e => setKeyStatus(e.keyCode, false)
    }
  }
}
</script>

<style lang="less" scoped>
.file-list-box {
  overflow: hidden;
  display: flex;
  position: relative;
  min-height: calc(100% - 55px);
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
</style>
