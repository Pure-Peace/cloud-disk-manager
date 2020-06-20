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
            :class="fileItemStyle(idx)"
            :title="fileItemTitle(file)"
            @click="selectFile(file, idx)"
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
      selectedFileIdx: -1,
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
    this.mixinScrollBarOptions()
    if (!this.currentDir) this.currentDir = this.$bus.appGetPath('desktop')
  },
  methods: {
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
    selectFile (file, idx) {
      const select = (multiple) => {
        this.selectedFileIdx = idx
        if (multiple) this.selectedFilesIdx.push(idx)
        else this.selectedFilesIdx = [idx]
        this.$emit('fileSelected', file, idx)
        log(idx, file, 'selected')
      }
      const unselect = () => {
        this.selectedFileIdx = null
        this.selectedFilesIdx.splice(this.selectedFilesIdx.indexOf(idx), 1)
        this.$emit('fileUnselected', file, idx)
        log(idx, file, 'unselected')
      }
      const selected = this.selectedFilesIdx.includes(idx)
      if (this.onCtrl) {
        if (selected) unselect()
        else select(true)
      } else if (!selected) select()
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

</style>
