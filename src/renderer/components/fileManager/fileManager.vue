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
              @handleSelect="(file, handle)=>handleSelectFile(file, handle)"
              @fileDoubleClick="handleFileDoubleClick"
              @fileClick="handleFileClick"
            />
            <empty-status
              :show="listingDir === 2 && visibleFileList.length === 0"
              :text="searchValue ? '未搜索到任何结果哦' : '目录是空的哦'"
              @contextmenu.native="emptyShowContextMenu"
            >
              <div
                v-if="searchValue"
                class="handle-button"
                style="margin-top: 20px;"
                @click="$refs.fileInfo.handleSearch('clear')"
              >
                关闭搜索
              </div>
            </empty-status>
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
      ref="fileInfo"
      :file="selectedFile"
      :file-list="fileList"
      :dir="currentDir"
      :search-value="searchValue"
      :visible-list="visibleFileList"
      :selected-files="selectedFiles"
      @filterChange="(changedFilters)=>{filters = changedFilters}"
      @unselectFile="file => handleSelectFile(file, 'unselect')"
      @searchFile="(searchOptions)=>handleSearchFile(searchOptions)"
    />
    <float-button
      :menu-opened="floatMenuOpen"
      @click="handleFloatButtonClick"
    >
      <div :class="floatButtonMenuClass">
        <div class="menu-action-button">
          <span>名称排序</span>
          <span style="padding: 0 5px;">
            <svg-icon icon-class="pro-view" />
          </span>
        </div>
        <div class="menu-action-button">
          <span>名称排序</span>
          <span style="padding: 0 5px;">
            <svg-icon icon-class="pro-view" />
          </span>
        </div>
        <div class="menu-action-button">
          <span>创建时间排序</span>
          <span style="padding: 0 5px;">
            <svg-icon icon-class="pro-view" />
          </span>
        </div>
        <div class="menu-action-button">
          <span>修改时间排序</span>
          <span style="padding: 0 5px;">
            <svg-icon icon-class="pro-view" />
          </span>
        </div>
      </div>
    </float-button>
  </div>
</template>

<script>
// fileManager components
import File from './file.js'
import fileListItem from './fileListItem.vue'
import fileInfo from './fileInfo.vue'
import fileListTopbar from './fileListTopbar.vue'

// other components
import vueLoading from 'vue-element-loading'
import dragResize from 'components/dragResize.vue'
import emptyStatus from 'components/emptyStatus.vue'
import floatButton from 'components/floatButton.vue'

const log = console.log

export default {
  components: {
    dragResize,
    fileInfo,
    vueLoading,
    fileListTopbar,
    emptyStatus,
    fileListItem,
    floatButton
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
      selectedFile: null,
      selectedFiles: [],
      fileList: [],
      visibleCount: 10,
      visibleFileList: [],
      listingDir: 0, // 0: 未列目录; 1: 正在列目录; 2: 已列完目录
      filters: {},
      searchOptions: {},
      filted: 0,
      fileItemHeight: 70,
      searchValue: '',
      floatMenuOpen: false,
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
  computed: {
    floatButtonMenuClass () {
      return (
        'float-button-menu-box' +
        (this.floatMenuOpen ? ' float-button-menu-box-opened' : '')
      )
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
      if (!this.searchValue) {
        // 将文件内容区的最小高度设置为数据完全加载后的高度
        // 由于实际上列表数据是懒加载的，这样做可以使得滚动条的比例完整，让人一眼看不出来是懒加载
        this.$refs.fileListContent.style.minHeight = `${this.fileList.length * this.fileItemHeight}px`
        this.visibleFileList = this.fileList.slice(0, this.visibleCount)
      } else {
        this.handleSearchFile(Object.assign({ value: this.searchValue }, this.searchOptions))
      }
    },

    // 当前文件内容区可视文件数量变更
    visibleCount (visibleCount) {
      this.visibleFileList = this.fileList.slice(0, visibleCount)
    },

    filters: {
      deep: true,
      handler: function (filters) {
        if (!this.visibleFileList.length || Object.keys(filters).length === 0) return
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
        const length = this.searchValue ? this.visibleFileList.length : this.fileList.length
        this.$refs.fileListContent.style.minHeight = `${(length - filtedCount) * this.fileItemHeight}px`
      }
    }
  },
  mounted () {
    this.watchKeyEvent()
    this.$nextTick(() => {
      // 初始加载2屏的数据
      this.visibleCount =
        Math.round(this.$refs.vueScroll.$el.clientHeight / this.fileItemHeight) * 2
    })
  },
  created () {
    this.initialCurrentDir()
  },
  methods: {
    // 文件搜索
    handleSearchFile (searchOptions) {
      const searchResutlList = []
      const { value, ...options } = searchOptions

      // 无任何改变就不重复进行搜索了
      if (this.searchValue === value && this.searchOptions === options) return
      this.searchValue = value
      this.searchOptions = options

      let searchMethod

      // 大小写不敏感
      const notCaseSensitive = file => {
        if (file.name.toLowerCase().includes(value.toLowerCase())) return true
      }

      // 大小写敏感
      const caseSensitive = file => {
        if (file.name.includes(value)) return true
      }

      // 全等
      const congruent = file => {
        if (file.name === value) return true
      }

      // 全等不敏感
      const congruentNoCase = file => {
        if (file.name.toLowerCase() === value.toLowerCase()) return true
      }

      // 正则
      const regexpSearcher = (regexpObject) => {
        return file => {
          if (file.name.match(regexpObject)) return true
        }
      }

      log(`start to search file [${value}]`)
      const start = Date.now()
      // 按照options选择搜索方法
      if (options.regexp.status) {
        try {
          const regexp = new RegExp(value)
          searchMethod = regexpSearcher(regexp)
        } catch (err) {
          console.warn(`search interrupt: Invalid regular expression: ${value}`)
          return
        }
        // 全等搜索要避免搜索空字符串（这样将会无结果）
      } else if (options.congruent.status && value !== '') {
        searchMethod = options.caseSensitive.status
          ? congruent
          : congruentNoCase
      } else {
        searchMethod = options.caseSensitive.status
          ? caseSensitive
          : notCaseSensitive
      }

      // 搜索
      for (const file of this.fileList) {
        if (searchMethod(file)) searchResutlList.push(file)
      }
      this.visibleFileList = searchResutlList
      this.$refs.fileListContent.style.minHeight = `${searchResutlList.length * this.fileItemHeight}px`

      log(
        `search complete, find result: ${searchResutlList.length}`,
        searchResutlList,
        `time spent: ${Date.now() - start}ms`
      )
    },

    // 浮动按钮单击事件
    handleFloatButtonClick () {
      this.floatMenuOpen = !this.floatMenuOpen
    },

    // 当1屏的大小发生变化时，重新计算1屏的可视数据量
    visibleAeraResize () {
      const resizedVisibleCount =
        Math.round(this.$refs.vueScroll.$el.clientHeight / this.fileItemHeight) * 2
      if (this.visibleCount < resizedVisibleCount) {
        this.visibleCount = resizedVisibleCount
      }
    },

    // 滚动时懒加载
    visibleAeraScroll (vertical) {
      if (this.searchValue) return
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
          Math.round(this.$refs.vueScroll.$el.clientHeight / this.fileItemHeight) +
          Math.round(this.scrollLength / this.fileItemHeight)
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
      log(`listing directory [${dirPath}]...`)
      const start = Date.now()

      // 如果之前选择过的文件没有发生改变，将重建File对象，并保留之前的选择
      const handleHasSelectFiles = fileList => {
        let tempSelectedFile = null

        const tempSelectedFiles = []
        const selectedFile = this.selectedFile
        const selectedFiles = this.selectedFiles

        // 遍历文件列表并查找selectedFiles，如果找不到文件就将选择丢失
        this.fileList = fileList.map(fileInfo => {
          const file = new File(fileInfo)
          const selectedIdx = selectedFiles.findIndex(
            selectedFile => selectedFile.ino === file.ino
          )

          if (selectedIdx !== -1) {
            file.selected = true
            tempSelectedFiles.push(file)
          }

          if (
            !tempSelectedFile &&
            selectedFile &&
            selectedFile.ino === file.ino
          ) {
            file.selected = true
            tempSelectedFile = file
          }
          return file
        })
        this.selectedFile = tempSelectedFile
        this.selectedFiles = tempSelectedFiles
      }

      // 一般处理，仅重建File对象
      const handleCommon = fileList => {
        this.fileList = fileList.map(fileInfo => new File(fileInfo))
      }

      // 异步非阻塞取出目标目录下所有文件，并获取所有文件的详细信息，等待全部完成后返回
      // 由于这是通过子服务chokidarService进行处理的，所以实际上当前进程只需要等待结果即可
      this.$bus
        .chokidarHandler('listDir', { dirPath })
        .then(result => {
          // 判断是否出错
          if (result.error) {
            if (result.error === 1) this.$bus.dialog.showErrorBox('无法找到目录', `列目录时发生错误，找不到指定目录"${dirPath}"，请检查是否输入了正确的目录。`)
            else this.$bus.dialog.showErrorBox('列目录时发生错误', result.message)
            throw new Error(result.message)
          }

          // 由于上述过程完成的结果是通过ipc通信发送的，所以对象的方法将会丢失，因此在这里重建我们File类的方法
          if (this.selectedFiles.length > 0) {
            handleHasSelectFiles(result.fileList)
          } else handleCommon(result.fileList)

          // 完成
          this.$emit('folderChanged', {
            dir: this.currentDir,
            fileList: this.fileList
          })
          this.listingDir = 2

          log(
            `directory listing completed. file total: ${
              this.fileList.length
            }, time spent: ${Date.now() - start}ms`
          )
        })
        .catch(err => {
          log(`failed when listing directory [${dirPath}]`)
          this.listingDir = 2
          throw new Error(err)
        })
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

        // 如果取消的是当前正在展示信息的文件，则切换到其它文件的信息展示
        if (this.selectedFile === file) {
          const before = currentFileIndex - 1
          this.selectedFile = this.selectedFiles[
            before >= 0 ? before : this.selectedFiles.length - 1
          ]
        }
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

      // 多选处理
      const handleMultiple = () => {
        if (selected) unselect()
        else select(true)
      }

      // 单选处理
      const handleSingle = () => {
        if (this.selectedFiles.length > 0 || this.selectedFile) unselectAll()
        select()
      }

      // 按住ctrl进行多选处理
      if (this.$bus.keys.ctrl) handleMultiple()
      else if (!selected) handleSingle()
    },

    // 局部监听按键按下状态
    watchKeyEvent () {
      const setKeyStatus = (keyCode, status) => {
        switch (keyCode) {
          case 116: // 按下f5
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
@import "../../themes/light.less";

.file-list-box {
  overflow: hidden;
  display: flex;
  position: relative;
  min-height: calc(100% - 60px);
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

.float-button-menu-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: -1;
  bottom: 25px;
  right: 25px;
  height: 0px;
  opacity: 0;
  width: 0px;
  overflow: hidden;
  justify-content: center;
  border-radius: 4px;
  background-color: #fafafa;
  border: 2px solid #5E72E4;
  transition: 0.2s ease;
  box-shadow: 0 1px 2px 2px rgba(179, 179, 179, 0.329);
}

.float-button-menu-box-opened {
  height: calc(4 * 40px);
  opacity: 1;
  width: 150px;
  display: flex;
}

.control-button {
  white-space: nowrap;
  background-color: #f1f2f6;
  padding: 5px 8px;
  border-radius: 4px;
  transition: 0.2s ease;
  margin-right: 10px;
  font-size: 13px;
  cursor: pointer;
  color: @primary;
}

.control-button:hover {
  filter: brightness(0.9);
}

.control-button:active {
  filter: brightness(0.8);
}

.control-button-actived {
  color: @white;
  background-color: @primary;
}

.control-button-disalbed {
  pointer-events: none;
  filter: brightness(0.9);
  opacity: 0.9;
}

.control-button-warning {
  background-color: #ffcdd2;
  color: #000000;
}

.handle-button {
  cursor: pointer;
  white-space: nowrap;
  background-color: #E8EAF6;
  padding: 8px 18px;
  border-radius: 4px;
  transition: 0.2s ease;
  font-size: 14px;
  cursor: pointer;
  color: #000000;
}

.handle-button:hover {
  filter: brightness(.9);
}

.handle-button:active {
  filter: brightness(.8);
}

.menu-action-button {
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  width: 148px;
  height: 40px;
  background-color: #4C63E7;
  transition: 0.2s ease;
  font-size: 12px;
  cursor: pointer;
  color: #FFFFFF;
  transition: .2s ease;
}

.menu-action-button:hover {
  filter: brightness(0.9);
}

.menu-action-button:active {
  filter: brightness(0.8);
}
</style>
