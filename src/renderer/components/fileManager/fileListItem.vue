<template>
  <div
    v-if="file"
    :class="fileItemClass"
    :title="file.path"
    @click="emitFileClick"
    @dblclick="emitFileDoubleClick"
    @contextmenu.prevent="fileShowContextmenu"
  >
    <div class="file-icon-box">
      <svg-icon
        class="file-icon"
        :icon-class="file.iconClass"
      />
    </div>
    <div style="display: flex; justify-content: space-between; width: calc(100% - 48px);">
      <div
        class="file-self-box"
        style="width: calc(100% - 280px); min-width: 260px;"
      >
        <div
          v-show="!renaming"
          class="file-name"
        >
          {{ file.name }}
        </div>
        <div
          v-show="renaming"
          class="file-name"
        >
          <input
            ref="fileNameInput"
            class="file-name-input"
            :value="file.name"
            @blur.prevent="renaming = false"
            @keypress.enter="renaming = false"
          >
        </div>
        <div class="file-info-box">
          <div class="file-info">
            <span>类型:</span>
            <span style="color: #000000;">{{ file.type }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="file.initialed"
        class="file-self-box last-self-box"
      >
        <div class="file-info">
          <span>大小:</span>
          <span class="info-text">{{ file.isDir ? '-' : file.sizeFormatted }}</span>
        </div>

        <div class="file-info">
          <span>修改时间:</span>
          <span class="info-text">{{ file.timeFormatted('ctime') }}</span>
        </div>
      </div>
      <div
        v-if="!file.initialed"
        class="file-self-box last-self-box"
        style="justify-content: center;"
      >
        <div class="file-info">
          <span>信息:</span>
          <span class="info-text">无访问权限</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    file: {
      type: Object,
      default: () => {}
    },
    show: {
      type: Boolean,
      default: true
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      renaming: false
    }
  },
  computed: {
    // 列表项目样式，含过滤器
    fileItemClass () {
      return 'file-item' + (this.show === true ? '' : ' file-filted') + (this.file.selected === true ? ' file-selected' : '')
    }
  },
  watch: {
    renaming (val) {
      if (val === true) {
        this.$nextTick(() => {
          this.$refs.fileNameInput.focus()
        })
      } else {
        const targetName = this.$refs.fileNameInput.value.trim()
        if (targetName !== this.file.name) this.file.rename(targetName)
      }
    }
  },

  methods: {
    emitFileClick () {
      this.$emit('fileClick')
    },

    emitFileDoubleClick () {
      this.$emit('fileDoubleClick')
    },

    // 文件项目右键单击上下文菜单
    fileShowContextmenu (event) {
      const file = this.file
      // 共用菜单项
      const publicMenuItems = [
        {
          label: file.path,
          disabled: true
        },
        {
          label: '添加到选择' + (!file.selected ? '（CTRL + 鼠标左键）' : ''),
          disabled: file.selected,
          onClick: () => {
            this.$emit('handleSelect', 'addselect')
          }
        },
        {
          label: '从选择移除' + (file.selected ? '（CTRL + 鼠标左键）' : ''),
          disabled: !file.selected,
          divided: true,
          onClick: () => {
            this.$emit('handleSelect', 'unselect')
          }
        },
        {
          label: '取消所有选择',
          divided: true,
          disabled: this.selectedCount === 0,
          onClick: () => {
            this.$emit('handleSelect', 'unselectAll')
          }
        },
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
          divided: true,
          onClick: () => {
            this.$bus.clipboard.writeText(file.getInfo())
          }
        },
        {
          label: '粘贴',
          divided: true,
          onClick: () => {
            console.log(this.$parent)
            this.$emit('handlePaste')
          }
        },
        {
          label: '复制',
          onClick: () => {
            this.$emit('handleCopy')
          }
        },
        {
          label: '剪切',
          onClick: () => {
            this.$emit('handleCut')
          }
        },
        {
          label: '移动',
          divided: true,
          onClick: () => {
            this.$emit('handleMove')
          }
        },
        {
          label: '重命名',
          onClick: () => {
            this.renaming = true
          }
        },
        {
          label: '删除',
          onClick: () => {
            file.remove()
            this.$emit('fileRemoved')
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
      const fileMenuItems = []

      // 设置菜单
      this.$contextmenu({
        items: [
          ...(file.isDir ? dirMenuItems : fileMenuItems),
          ...publicMenuItems
        ],
        event,
        zIndex: 3,
        minWidth: 230,
        el: this.$el
      })
    }
  }
}
</script>

<style lang="less" scoped>
.file-item {
  overflow: hidden;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  padding: 0 10px;
  align-items: center;
  border-right: 1px solid rgba(255, 255, 255, 0);
  border-left: 1px solid rgba(255, 255, 255, 0);
  border-bottom: 1px solid rgba(210, 214, 241, .6);
  height: 70px;
  // transition: background-color .2s ease;
}

.file-item:hover {
  background-color: #F2F4FF;
}

.file-icon-box {
  min-height: 2rem;
  min-width: 2rem;
  height: 2rem;
  width: 2rem;
  margin: 0 10px;
}

.file-icon {
  height: 100% !important;
  width: 100% !important;
}

.file-name {
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif;
  line-height: 22px;
  color: #000000;
  padding: 0 5px;
}

.file-self-box {
  padding: 0 10px;
}

.file-info-box {
  padding: 0 4px;
  display: flex;
  display: flex;
  align-items: center;

  :not(:first-child) {
    margin-left: 8px;
  }
}

.file-info {
  display: flex;
  color: #545454;
  //background-color: @primary;
  font-size: 12px;
  padding: 2px 0;
  border-radius: 4px;
}

.contextmenu-active {
  color: #000000 !important;
  background-color: #E1E4F1 !important;
}

.file-filted {
  display: none;
}

.file-selected {
  color: #000000 !important;
  background-color: #EDF0FF !important;
  border-left: 1px solid rgba(210, 214, 241, .6);
  border-right: 1px solid rgba(210, 214, 241, .6);
}

.last-self-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 230px;
}

.info-text {
  color: #000000;
  margin-left: 8px;
}

.file-name-input {
  display: block;
  height: 100%;
  width: 100%;
  max-width: 500px;
  min-height: 26px;
  border: 2px solid #f1f1f1;
  padding: 0 10px;
  transition: 0.2s ease;
  border-radius: 4px;
  font-size: 14px;
  color: #303F9F;
}

.file-name-input:hover {
  border-color: #7a94ff;
}

.file-name-input:focus {
  border-color: #7a94ff;
}

</style>
