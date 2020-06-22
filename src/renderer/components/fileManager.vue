<template>
  <div class="file-list-box">
    <div
      ref="filelist"
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
        <div>
          <div
            v-for="(file, idx) in fileList"
            :key="idx"
            :ref="`fileitem${idx}`"
            class="file-item"
            :title="file.path"
            @click="handleFileClick(file, idx)"
            @contextmenu.prevent="showContextmenu($event, file, idx)"
          >
            <span class="file-name">{{ file.name }}</span>
          </div>
        </div>
      </vue-scroll>
      <drag-resize
        :element="$refs.filelist"
        @resizing="handleResizing"
        @resized="handleResized"
      />
    </div>
  </div>
</template>

<script>
import dragResize from 'components/dragResize.vue'

const fs = require('fs-extra')
const PATH = require('path')

const log = console.log

export default {
  components: {
    dragResize
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
      selectedFileIdx: undefined,
      selectedFilesIdx: [],
      fileList: [],
      listingDir: true,
      currentDir: this.targetDir,
      scrollBarOptions: this.$bus.mixinScrollBarOptions()
    }
  },
  computed: {

  },
  watch: {
    currentDir (dirPath) {
      setImmediate(async () => { this.fileList = await this.listdir(dirPath) })
    },
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
  },
  created () {
    this.initialCurrentDir()
  },
  methods: {
    handleResizing () {
      this.scrollBarOptions.bar.disable = true
      this.$refs.vueScroll.$el.style.pointerEvents = 'none'
    },
    handleResized () {
      this.scrollBarOptions.bar.disable = false
      this.$refs.vueScroll.$el.style.pointerEvents = ''
    },
    initialCurrentDir () {
      setImmediate(() => { if (!this.currentDir) this.currentDir = this.$bus.appGetPath('desktop') })
    },
    handleFileClick (file, idx) {
      this.selectFile(file, idx)
    },
    getFileInfo (path) {
      const base = {
        name: PATH.basename(path),
        path,
        dir: PATH.dirname(path),
        ext: PATH.extname(path),
        initialed: false
      }
      try {
        const stats = fs.statSync(path)
        Object.assign(base, stats)
        base.isDir = stats.isDirectory()
        base.isFile = stats.isFile()
        base.isBlockDevice = stats.isBlockDevice()
        base.isCharacterDevice = stats.isCharacterDevice()
        base.initialed = true
        return base
      } catch (err) {
        log(`failed when stat file: ${path},`, new Error(err))
        return base
      }
    },
    showContextmenu (event, file, idx) {
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
          { label: '查看网页源代码(V)', icon: 'dir' },
          { label: '检查(N)' }
        ],
        event,
        zIndex: 3,
        minWidth: 230,
        el: this.$refs[`fileitem${idx}`][0]
      })
    },

    async listdir (dirPath) {
      try {
        log(`listing directory [${dirPath}]...`)
        const start = Date.now()
        this.listingDir = true
        const fileList = await Promise.all(
          fs.readdirSync(dirPath).map(
            async (fileName) => await this.getFileInfo(PATH.join(dirPath, fileName))
          )
        )
        log(`directory listing completed. file total: ${fileList.length}, spent time: ${Date.now() - start}ms`)
        this.listingDir = false
        return fileList
      } catch (err) {
        log(`filed when listing directory [${dirPath}]`)
        this.listingDir = false
        throw new Error(err)
      }
    },

    selectFile (file, idx) {
      const select = (multiple) => {
        this.selectedFileIdx = idx
        if (multiple) this.selectedFilesIdx.push(idx)
        else this.selectedFilesIdx = [idx]
        target.className += ' file-selected'
        this.$emit('fileSelected', file, idx)
        log(idx, file, file.name, 'selected')
      }

      const unselect = () => {
        this.selectedFileIdx = null
        this.selectedFilesIdx.splice(this.selectedFilesIdx.indexOf(idx), 1)
        target.className = target.className.replace(' file-selected', '')
        this.$emit('fileUnselected', file, idx)
        log(idx, file, file.name, 'unselected')
      }

      const unselectAll = () => {
        this.selectedFilesIdx.forEach(fileIdx => {
          const target = this.$refs[`fileitem${fileIdx}`][0]
          target.className = target.className.replace(' file-selected', '')
        })
      }

      const target = this.$refs[`fileitem${idx}`][0]
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
      document.onkeydown = (e) => setKeyStatus(e.keyCode, true)
      document.onkeyup = (e) => setKeyStatus(e.keyCode, false)
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
}

.file-list:hover .__bar-is-vertical {
  display: none !important;
}

.file-item {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  padding: 0 10px;
  line-height: 28px;
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
