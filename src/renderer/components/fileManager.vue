<template>
  <div class="file-list-box">
    <div
      ref="fileList"
      class="file-list"
      @mouseenter="showScrollBar"
      @mouseleave="hideScrollBar"
    >
      <div class="file-list-topbar">
        <div class="file-currentdir">
          {{ currentDir }}
        </div>
      </div>
      <vue-scroll
        ref="vueScroll"
        :ops="scrollBarOptions"
      >
        <div :style="fileListContentStyle">
          <div
            v-for="(file, idx) in dirFiles"
            :key="idx"
            :ref="`fileItem${idx}`"
            class="file-item"
            :title="fileItemTitle(file)"
            @click="selectFile(file, idx)"
            @contextmenu.prevent="showContextmenu($event, file, idx)"
          >
            <span class="file-name">{{ file }}</span>
          </div>
        </div>
        <div
          class="drag-resize"
          @mousedown="dragResize"
        />
      </vue-scroll>
    </div>
  </div>
</template>

<script>
const fs = require('fs')

const log = console.log

export default {
  props: {
    targetDir: {
      type: String,
      default: ''
    },
    resizeWidth: {
      type: Number,
      default: 4
    },
    scrollBarOps: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      onCtrl: false,
      onShift: false,
      onContextmenuFileIdx: undefined,
      selectedFileIdx: undefined,
      selectedFilesIdx: [],
      dirFiles: [],
      resizing: false,
      currentDir: this.targetDir,
      scrollBarOptions: {
        scrollPanel: {
          scrollingX: false,
          scrollingY: true,
          speed: 0,
          verticalNativeBarPos: 'right'
        },
        bar: {
          background: '#000000',
          opacity: 0.3,
          specifyBorderRadius: '0px',
          size: '10px',
          showDelay: 500,
          keepShow: false,
          disable: false
        },
        rail: {
          size: '10px',
          specifyBorderRadius: '0px',
          gutterOfEnds: null,
          gutterOfSide: '4px',
          keepShow: false
        }
      }
    }
  },
  computed: {
    fileListContentStyle () {
      return this.resizing ? 'pointer-events: none;' : ''
    },
    fileItemStyle () {
      return (idx) => {
        let classNames = 'file-item'
        if (this.selectedFileIdx === idx || this.selectedFilesIdx.includes(idx)) classNames += ' file-selected'
        return classNames
      }
    },
    fileItemTitle () {
      return (file) => {
        return `${this.currentDir}\\${file}`
      }
    }
  },
  watch: {
    currentDir () {
      this.getDirFiles()
    }
  },
  mounted () {
    this.watchKeyEvent()
  },
  created () {
    this.$on('test', () => { console.log('caonima') })
    this.mixinScrollBarOptions()
    if (!this.currentDir) this.currentDir = this.$bus.appGetPath('desktop')
  },
  methods: {
    showContextmenu (event, file, idx) {
      // this.fileOnContextmenu(file, idx)
      this.$contextmenu({
        items: [
          {
            label: '返回(B)',
            onClick: () => {
              this.message = '返回(B)'
              console.log('返回(B)')
            }
          },
          { label: '前进(F)', disabled: true },
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
          { label: '查看网页源代码(V)', icon: 'el-icon-view' },
          { label: '检查(N)' }
        ],
        event,
        // x: event.clientX,
        // y: event.clientY,
        customClass: 'class-a',
        zIndex: 3,
        minWidth: 230,
        el: this.$refs[`fileItem${idx}`][0]
      })
    },

    getDirFiles () {
      log(`listing directory [${this.currentDir}]...`)
      const start = Date.now()
      const result = fs.readdirSync(this.currentDir)
      this.dirFiles = result
      log(`directory listing completed. file total: ${result.length}, spent time: ${Date.now() - start}ms`)
      return result
    },
    mixinScrollBarOptions () {
      const options1 = this.scrollBarOps
      if (options1 && Object.keys(options1).length > 0) {
        const options2 = this.scrollBarOptions
        for (const key1 in options1) {
          for (const key2 in options2) {
            if (key2 === key1) {
              options2[key2] = Object.assign(options2[key2], options1[key1])
              delete (options1[key1])
              break
            }
          }
        }
        Object.assign(options2, options1)
        this.scrollBarOptions = options2
      }
    },
    fileOnContextmenu (file, idx) {
      const getTarget = (index) => this.$refs[`fileItem${index}`][0]
      const select = () => {
        this.onContextmenuFileIdx = idx
        getTarget(idx).className += ' file-oncontextmenu'
        log(idx, file, 'onContextmenu')
      }
      const unselect = () => {
        const target = getTarget(lastIdx)
        target.className = target.className.replace(' file-oncontextmenu', '')
      }

      const lastIdx = this.onContextmenuFileIdx
      if (lastIdx !== idx) {
        if (lastIdx) unselect()
        select()
      }
    },
    selectFile (file, idx) {
      const select = (multiple) => {
        this.selectedFileIdx = idx
        if (multiple) this.selectedFilesIdx.push(idx)
        else this.selectedFilesIdx = [idx]
        target.className += ' file-selected'
        this.$emit('fileSelected', file, idx)
        log(idx, file, 'selected')
      }

      const unselect = () => {
        this.selectedFileIdx = null
        this.selectedFilesIdx.splice(this.selectedFilesIdx.indexOf(idx), 1)
        target.className = target.className.replace(' file-selected', '')
        this.$emit('fileUnselected', file, idx)
        log(idx, file, 'unselected')
      }

      const unselectAll = () => {
        this.selectedFilesIdx.forEach(fileIdx => {
          const target = this.$refs[`fileItem${fileIdx}`][0]
          target.className = target.className.replace(' file-selected', '')
        })
      }

      const target = this.$refs[`fileItem${idx}`][0]
      const selected = this.selectedFilesIdx.includes(idx)
      // multiple select
      if (this.onCtrl) {
        if (selected) unselect()
        else select(true)
      } else {
        // single select
        if (!selected) {
          unselectAll()
          select()
        }
      }
    },
    showScrollBar () {
      this.$refs.vueScroll.showBar()
      this.$refs.vueScroll.vuescroll.state.dontHide = true
    },
    hideScrollBar () {
      this.$refs.vueScroll.vuescroll.state.dontHide = false
      this.$refs.vueScroll.hideBar()
    },
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
      document.onkeydown = (e) => {
        setKeyStatus(e.keyCode, true)
      }
      document.onkeyup = (e) => {
        setKeyStatus(e.keyCode, false)
      }
    },
    dragResize (e) {
      const clearEvents = e => {
        document.onmouseup = undefined
        document.onmousemove = undefined
        document.onmouseup = undefined
        document.onmouseout = undefined
        document.body.style.cursor = 'auto'
        this.scrollBarOptions.bar.disable = false
        this.resizing = false
      }
      const stopDrag = e => clearEvents(e)
      const initDragEvents = e => {
        document.onmouseleave = () => stopDrag(e)
        document.onmouseup = e => stopDrag(e)
        document.onmousemove = e => {
          const width = this.$refs.fileList.clientWidth
          this.$refs.fileList.style.width = width + e.movementX + 'px'
        }
      }
      this.scrollBarOptions.bar.disable = true
      this.resizing = true
      document.body.style.cursor = 'ew-resize'
      initDragEvents(e)
    }
  }
}
</script>

<style lang="less" scoped>
.file-list-topbar {
  padding: 0 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #f1f2f6;
  height: 35px;
  font-size: 12px;
  color: #616161;
  box-shadow: 0 1px 1px rgba(50, 50, 93, 0.1);
}

.file-currentdir {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-list-box {
  height: 100%;
}

.file-list {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  max-width: 100%;
  min-width: 80px;
  background-color: #f3f3f3;
}

.drag-resize {
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
}

.file-list:hover .__bar-is-vertical {
  display: none !important;
}

.file-item {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 22px;
  cursor: pointer;
  padding: 0 10px;
  color: #616161;
}

.file-item:hover {
  background-color: #dedede;
}

.file-name {
  font-size: 13px;
  font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif;
  line-height: 22px;
  padding: 0 5px;
}

.file-selected {
  color: #895503 !important;
  background-color: #E4E6F1 !important;
}

.contextmenu-active {
  color: #A96C0C !important;
  background-color: #D8DAE5 !important;
}

</style>
