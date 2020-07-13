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
        title="将当前项目取消选择（快捷方式：CTRL + 鼠标左键单击列表中的项目）"
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
          v-if="!file"
          class="file-non-select-file"
        >
          <div class="file-icon-box">
            <svg-icon
              class="file-icon"
              icon-class="file-box"
            />
          </div>
          <div class="file-detail-name">
            请选择一个项目
          </div>
          <div class="file-dirinfo-box">
            <div class="file-detail-item">
              <div>当前目录:</div>
              <div>{{ dir }}</div>
            </div>
            <div class="file-detail-item">
              <div>项目总数:</div>
              <div>{{ fileList.length }}</div>
            </div>
            <div class="file-detail-item">
              <div>目录数:</div>
              <div>{{ dirCount }}</div>
            </div>
            <div class="file-detail-item">
              <div>文件数:</div>
              <div>{{ fileCount }}</div>
            </div>
            <div class="file-detail-item">
              <div>估计目录大小:</div>
              <div>{{ $bus.sizeFormat(sizeTotal) }}</div>
            </div>
          </div>
          <div
            v-if="fileCount"
            class="file-dirinfo-box"
          >
            <div class="file-detail-name">
              文件类型过滤器
            </div>
            <div class="file-filter-box">
              <div
                v-for="(fileFilter, ext) in fileTypeFilters"
                :key="ext + 'filter'"
                :class="fileTypeFilterButtonClass(fileFilter.status)"
                :title="`文件类型：${ext}; 文件数量：${fileFilter.count}; ${fileFilter.status === true ? '已显示' : '已过滤'}`"
                @click="fileFilter.status = !fileFilter.status"
              >
                <span class="file-filter-ext">{{ ext }}</span>
                (<span class="file-filter-count">{{ fileFilter.count }}</span>)
              </div>
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
      filters: {},
      dirCount: 0,
      fileCount: 0,
      sizeTotal: 0,
      fileTypeFilters: {},
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
    fileTypeFilterButtonClass () {
      return status => {
        return (
          'file-type-filter-button' +
          (status === true ? ' file-type-filter-enabled' : '')
        )
      }
    }
  },
  watch: {
    selectedFile (selection) {
      this.file = selection && selection.file
      this.fileIdx = selection && selection.idx
    },
    async fileList (fileList) {
      let dirCount = 0
      let fileCount = 0
      let sizeTotal = 0
      const filters = {}
      for (const file of fileList) {
        if (file.isDir) dirCount++
        if (file.isFile) fileCount++
        sizeTotal += file.size

        if (!file.ext) continue
        if (file.ext in filters) filters[file.ext].count++
        else filters[file.ext] = { count: 1, status: true }
      }
      this.dirCount = dirCount
      this.fileCount = fileCount
      this.sizeTotal = sizeTotal
      this.fileTypeFilters = filters
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
  justify-content: center;
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
  color: @primary;
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
  margin-top: 25px;
  padding-top: 15px;
}

.file-type-filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #ffcdd2;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  transition: .2s ease;
}

.file-type-filter-button:hover {
  filter: brightness(.9);
}

.file-type-filter-button:active {
  filter: brightness(.8);
}

.file-type-filter-enabled {
  background-color: #B2DFDB;
}

.file-filter-box {
  display: flex;
  justify-content: center;
  padding: 15px 0;
  flex-wrap: wrap;
}

.file-filter-count {
  margin: 0 2px;
}

.file-filter-ext {
  font-weight: bold;
  margin-right: 2px;
}
</style>
