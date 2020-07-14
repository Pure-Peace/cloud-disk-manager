<template>
  <div class="file-list-topbar">
    <div
      class="folder-button"
      title="选择目录"
      @click="handleFolderSelect"
    >
      <span class="folder-button-icon">
        <svg-icon icon-class="dir" />
      </span>
      <span>目录</span>
    </div>
    <div
      v-if="historys[dir] && historys[dir].from"
      class="folder-button"
      title="返回"
      @click="handleChangeDir(historys[dir].from)"
    >
      <span class="folder-button-icon">
        <svg-icon icon-class="back-folder" />
      </span>
      <span>返回</span>
    </div>
    <div
      v-if="historys[dir] && historys[dir].to"
      class="folder-button"
      title="前进"
      @click="handleChangeDir(historys[dir].to)"
    >
      <span class="folder-button-icon">
        <svg-icon icon-class="ahead-folder" />
      </span>
      <span>前进</span>
    </div>
    <div
      class="folder-button"
      title="刷新（F5）"
      @click="$emit('refresh')"
    >
      <span class="folder-button-icon">
        <svg-icon
          :class="listingDir === 1 ? 'rorate-animate' : ''"
          icon-class="refresh"
        />
      </span>
    </div>
    <file-dir-path-bar
      :dir="dir"
      @changeDir="handleChangeDir(targetDir)"
    />
  </div>
</template>

<script>
import fileDirPathBar from './fileDirPathBar.vue'

export default {
  components: {
    fileDirPathBar
  },
  props: {
    dir: {
      type: String,
      default: ''
    },
    listingDir: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      historys: {}
    }
  },
  watch: {
    dir (currentDir, beforeDir) {
      this.historysHandler(currentDir, beforeDir)
    }
  },
  methods: {
    // 改变目录
    handleChangeDir (dir) {
      this.$emit('changeDir', dir)
    },

    // 目录变更历史记录处理，用于前进及后退
    historysHandler (currentDir, beforeDir) {
      if (beforeDir) {
        if (!this.historys[beforeDir]) {
          this.historys[beforeDir] = { to: currentDir }
        } else if (this.historys[beforeDir].from !== currentDir) {
          this.historys[beforeDir].to = currentDir
        }

        if (!this.historys[currentDir]) {
          this.historys[currentDir] = { from: beforeDir }
        } else if (this.historys[currentDir].to !== beforeDir) {
          this.historys[currentDir].from = beforeDir
        }
      }
      console.log(this.historys, 'dirChangeHistorys')
    },

    // 选择目录，等效于同步方法
    async handleFolderSelect () {
      const selection = await this.$bus.dialog.showOpenDialog(this.$bus.win, {
        properties: [
          'openDirectory',
          'showHiddenFiles',
          'treatPackageAsDirectory'
        ],
        message: '请选择您要打开的目录'
      })
      if (!selection.canceled && selection.filePaths[0]) {
        this.handleChangeDir(selection.filePaths[0])
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../themes/light.less";
.folder-button {
  white-space: nowrap;
  background-color: #f1f2f6;
  padding: 5px 8px;
  border-radius: 4px;
  transition: 0.2s ease;
  font-size: 12px;
  margin-left: 10px;
  cursor: pointer;
  min-height: 26px;
  color: @primary;
}

.folder-button:hover {
  filter: brightness(0.9);
}

.folder-button:active {
  filter: brightness(0.8);
}

.folder-button-icon {
    padding: 0 5px;
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

.rorate-animate {
  animation: circle 0.6s infinite linear;
}

@keyframes circle {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
