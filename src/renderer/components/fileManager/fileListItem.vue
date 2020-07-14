<template>
  <div
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
    <div class="file-self-box">
      <div class="file-name">
        {{ file.name }}
      </div>
      <div class="file-info-box">
        <div class="file-info">
          {{ file.type }}
        </div>
        <div
          v-if="file.initialed"
          class="file-info"
        >
          {{ file.timeTypeFormatted('ctime') }} {{ file.timeFormatted('ctime') }}
        </div>
        <div
          v-if="!file.initialed"
          class="file-info"
        >
          无访问权限
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
  computed: {
    // 列表项目样式，含过滤器
    fileItemClass () {
      return 'file-item' + (this.show === true ? '' : ' file-filted') + (this.file.selected === true ? ' file-selected' : '')
    }
  },

  methods: {
    emitFileClick () {
      this.$emit('fileClick', this.file)
    },

    emitFileDoubleClick () {
      this.$emit('fileDoubleClick', this.file)
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
            this.$emit('handleSelect', file, 'addselect')
          }
        },
        {
          label: '从选择移除' + (file.selected ? '（CTRL + 鼠标左键）' : ''),
          disabled: !file.selected,
          divided: true,
          onClick: () => {
            this.$emit('handleSelect', file, 'unselect')
          }
        },
        {
          label: '取消所有选择',
          divided: true,
          disabled: this.selectedCount === 0,
          onClick: () => {
            this.$emit('handleSelect', file, 'unselectAll')
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
          divided: true,
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
  padding: 6px 10px;
  align-items: center;
  border-bottom: 1px dashed #f1f2f6;
  height: 65px;
}

.file-item:hover {
  background-color: #F2F4FF;
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

.file-self-box {
  padding: 0 10px;
}

.file-info-box {
  padding: 4px 4px 0 4px;
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
  background-color: #E1E4F1 !important;
}

.file-filted {
  display: none;
}

.file-selected {
  color: #000000 !important;
  background-color: #EDF0FF !important;
}
</style>
