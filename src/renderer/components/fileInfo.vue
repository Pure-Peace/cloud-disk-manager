<template>
  <div class="file-detail-box">
    <div class="file-info-control-bar">
      <div
        v-if="file && file.isFile"
        class="control-button"
        :title="`将文件信息切换到${!showJsonViews ? '专业' : '一般'}视图显示`"
        @click="showJsonViews = !showJsonViews"
      >
        <span>{{ !showJsonViews ? '专业' : '一般' }}视图</span>
        <span style="padding: 0 5px;">
          <svg-icon :icon-class="!showJsonViews ? 'pro-view' : 'view'" />
        </span>
      </div>
      <div
        v-if="file"
        class="control-button"
        title="将当前文件取消选择（快捷方式：CTRL + 鼠标左键单击列表中的文件）"
        @click="$emit('unselectFile', {idx: fileIdx, file})"
      >
        <span>取消选择</span>
        <span style="padding: 0 5px;">
          <svg-icon icon-class="unselect-file" />
        </span>
      </div>
    </div>
    <vue-scroll :ops="scrollBarOptions">
      <div slot="scroll-content">
        <div
          v-show="!file"
          class="file-non-select-file"
        >
          <div class="file-icon-box">
            <svg-icon
              class="file-icon"
              icon-class="file-box"
            />
          </div>
          <div class="file-detail-name">
            请选择一个文件
          </div>
          <div class="file-dirinfo-box">
            <div class="file-detail-item">
              <div>当前目录:</div>
              <div>{{ dir }}</div>
            </div>
            <div class="file-detail-item">
              <div>项目总数:</div>
              <div>{{ fileList.length || '计算中...' }}</div>
            </div>
            <div class="file-detail-item">
              <div>目录数:</div>
              <div>{{ dirCount || '计算中...' }}</div>
            </div>
            <div class="file-detail-item">
              <div>文件数:</div>
              <div>{{ fileCount || '计算中...' }}</div>
            </div>
            <div class="file-detail-item">
              <div>估计目录大小:</div>
              <div>{{ $bus.sizeFormat(sizeCalc) || '计算中...' }}</div>
            </div>
          </div>
        </div>
        <json-viewer
          v-if="file && showJsonViews"
          :data="file.getInfo(false)"
        />
        <div
          v-if="file && !showJsonViews"
          class="file-info-head"
        >
          <div class="file-icon-box">
            <svg-icon
              class="file-icon"
              :icon-class="file.iconClass"
            />
          </div>
          <div class="file-detail-name">
            {{ file.name }}
          </div>
        </div>
        <div
          v-if="file && !showJsonViews"
          class="file-detail-block"
        >
          <div class="file-detail-content">
            <div class="file-detail-item">
              <div>类型:</div>
              <div>{{ file.type }}</div>
            </div>

            <div class="file-detail-item">
              <div>大小:</div>
              <div v-if="file.size">
                {{ file.sizeFormatted }}
              </div>
              <div v-else>
                fileList
                未计算
              </div>
            </div>

            <div
              v-if="file.ext"
              class="file-detail-item"
            >
              <div>文件后缀:</div>
              <div>{{ file.ext }}</div>
            </div>

            <div
              v-if="file.mime"
              class="file-detail-item"
            >
              <div>MIME:</div>
              <div>{{ file.mime }}</div>
            </div>
          </div>
          <div class="file-detail-content">
            <div class="file-detail-item">
              <div>所在目录:</div>
              <div>{{ file.dir }}</div>
            </div>

            <div class="file-detail-item">
              <div>完整路径:</div>
              <div>{{ file.path }}</div>
            </div>
          </div>
          <div
            v-if="file.initialed"
            class="file-detail-content"
          >
            <div
              v-for="timeType in file.timeTypes"
              :key="`file-${timeType}`"
              class="file-detail-item"
            >
              <div>{{ file.timeTypeFormatted(timeType) }}:</div>
              <div>{{ file.timeFormatted(timeType) }}</div>
            </div>
          </div>
          <div
            v-if="!file.initialed"
            class="file-detail-content"
          >
            <div class="file-detail-item">
              <div>文件信息:</div>
              <div>{{ file.note }}</div>
            </div>
          </div>
        </div>
        <div style="height: 55px;" />
      </div>
    </vue-scroll>
  </div>
</template>

<script>
import utils from 'components/utils.js'
import jsonViewer from 'components/jsonViewer.vue'

export default {
  components: {
    jsonViewer
  },
  props: {
    selectedFile: {
      type: Object,
      default: () => {}
    },
    selectedFiles: {
      type: Array,
      default: () => []
    },
    fileList: {
      type: Array,
      default: () => []
    },
    dir: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      utils,
      file: undefined,
      fileIdx: undefined,
      showJsonViews: false,
      scrollBarOptions: this.$bus.mixinScrollBarOptions({
        vuescroll: {
          detectResize: true
        },
        bar: {
          specifyBorderRadius: '4px',
          size: '6px',
          showDelay: 500
        },
        rail: {
          size: '6px',
          specifyBorderRadius: '4px',
          gutterOfSide: '-2px'
        }
      })
    }
  },
  computed: {
    dirCount () {
      return this.fileList.filter(file => file.isDir).length
    },
    fileCount () {
      return this.fileList.filter(file => file.isFile).length
    },
    sizeCalc () {
      return this.fileList.reduce((acc, file) => acc + file.size, 0)
    }
  },
  watch: {
    selectedFile (selection) {
      this.file = selection && selection.file
      this.fileIdx = selection && selection.idx
    }
  }
}
</script>

<style lang="less" scoped>
@import "../themes/light.less";
.file-icon-box {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 25px;
}

.file-icon {
  min-height: 3rem;
  min-width: 3rem;
  height: 3rem;
  width: 3rem;
}

.file-detail-box {
  flex: 1;
  border-left: 1px dashed #d5d8e3;
  min-width: 200px;
}

.file-detail-content {
  padding: 5px;
  border-top: 1px dashed #d5d8e3;
}

.file-detail-block {
  padding: 10px;
}

.file-detail-name {
  border-radius: 4px;
  padding: 5px;
  background-color: #e8eaf6;
  flex: 1;
  display: flex;
  user-select: text;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: bold;
}

.file-info-head {
  padding: 15px;
}

.file-detail-item {
  display: flex;
  font-size: 12px;
  flex-wrap: nowrap;
  align-self: baseline;
  justify-content: space-between;

  :not(:first-child) {
    margin: 5px 0;
  }
  :first-child {
    white-space: nowrap;
    border-radius: 4px;
    background-color: #f3f3f3;
    color: #000000;
    display: flex;
    align-self: baseline;
    padding: 4px 8px;
    margin-top: 8px;
    margin-right: 6px;
    letter-spacing: 0.2px;
  }
  :last-child {
    white-space: pre-wrap;
    word-wrap: normal;
    word-break: break-all;
    margin-left: 6px;
    border-radius: 4px;
    padding: 4px 8px;
    //color: @white;
    margin-top: 8px;
    user-select: text;
    //background-color: @primary;
  }
}

.file-info-control-bar {
  display: flex;
  padding: 10px 15px;
  border-bottom: 1px dashed #d5d8e3;
  height: 55px;
  align-items: center;
  justify-content: space-between;
}

.control-button {
  white-space: nowrap;
  background-color: #f1f2f6;
  padding: 5px 8px;
  border-radius: 4px;
  transition: 0.2s ease;
  margin-right: 10px;
  font-size: 12px;
  cursor: pointer;
}

.control-button:hover {
  filter: brightness(0.9);
}

.control-button:active {
  filter: brightness(0.8);
}

.file-non-select-file {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-dirinfo-box {
  border-top: 1px dashed #d5d8e3;
  margin: 25px 0;
  padding: 15px 0;
}
</style>
