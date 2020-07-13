<template>
  <div
    class="file-currentdir"
    :title="'当前目录：' + dir"
  >
    <span
      v-for="(dirName, idx) in dirList"
      :key="dirName + idx"
    >
      <span
        class="file-dirname"
        :style="dirList.slice(-1) == dirName ? 'font-weight: bold;' : ''"
        :title="`转到目录：${getTargetDir(idx)}`"
        @click="handleClickDirname(idx)"
      >
        {{ dirName }}
      </span>
      <span
        v-if="idx + 1 < dirList.length"
        class="file-sep"
      >{{ sep }}</span>
    </span>
  </div>
</template>

<script>
const PATH = require('path')

export default {
  props: {
    dir: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      sep: PATH.sep,
      dirList: []
    }
  },
  computed: {
    getTargetDir () {
      return (idx) => {
        // 取出目标路径
        const targetDir = this.dirList.slice(0, idx + 1).join(this.sep)
        // 若是根级目录，在路径最后方加上分隔符
        return targetDir.includes(this.sep) ? targetDir : targetDir + this.sep
      }
    }
  },
  watch: {
    dir (val) {
      this.dirList = this.dir.split(this.sep)
    }
  },

  methods: {
    // 地址栏单级目录单击发射changeDir事件
    handleClickDirname (idx) {
      const targetDir = this.getTargetDir(idx)
      this.$emit('changeDir', targetDir)
    }
  }

}
</script>

<style scoped>
.file-currentdir {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-left: 8px;
  padding: 5px 15px;
  border-radius: 4px;
  background-color: #f1f2f6;
  display: flex;
  align-content: center;
}

.file-sep {
  margin-right: 1px;
}

.file-dirname {
  cursor: pointer;
}

.file-dirname:hover {
  filter: brightness(.6);
  border-bottom: 1.2px dashed;
}
</style>
