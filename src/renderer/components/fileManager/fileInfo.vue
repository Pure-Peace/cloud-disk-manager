<template>
  <div class="file-detail-box">
    <div style="height: calc(100% - 60px);">
      <vue-scroll :ops="scrollBarOptions">
        <div
          v-if="view !== 'search' && !file || view === 'dir'"
          class="file-detail-dir-view"
        >
          <div
            v-show="!file"
            style="margin-bottom: 25px;"
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
          </div>
          <div v-show="file">
            <div class="file-icon-box">
              <div style="display: flex; width: 90%; justify-content: center;">
                <svg-icon
                  v-for="(selectedFile, idx) in selectedFiles"
                  :key="`selectedFileInfo${idx}`"
                  style="font-size: 3rem; min-height: 5px; min-width: 5px;"
                  :icon-class="selectedFile.iconClass || ''"
                />
              </div>
            </div>
            <div class="file-detail-name">
              已选择{{ selectedFiles.length }}个项目
            </div>
          </div>
          <div
            v-if="file"
            class="file-dirinfo-box"
            style="margin-top: 25px;"
          >
            <div class="file-detail-item">
              <div>当前项目:</div>
              <div>{{ file.name }}</div>
            </div>
            <div class="file-detail-item">
              <div>类型:</div>
              <div>{{ file.type }}</div>
            </div>
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
              <div>{{ calcing ? '计算中...' : dirCount }}</div>
            </div>
            <div class="file-detail-item">
              <div>文件数:</div>
              <div>{{ calcing ? '计算中...' : fileCount }}</div>
            </div>
            <div class="file-detail-item">
              <div>估计目录大小:</div>
              <div>{{ calcing ? '计算中...' : $bus.sizeFormat(sizeTotal) }}</div>
            </div>
          </div>
          <div
            v-if="fileCount"
            class="file-dirinfo-box"
            style="margin-top: 10px; padding-top: 20px;"
          >
            <div
              class="file-detail-name"
              style="user-select: none;"
              title="单击下列项目选择过滤指定的文件类型，右键单击此处可查看菜单"
              @contextmenu.prevent="fileFiltersContextmenu"
            >
              类型过滤器
            </div>
            <div
              v-if="!calcing"
              class="file-filter-box"
              @contextmenu.prevent="fileFiltersContextmenu"
            >
              <div
                v-for="(fileFilter, ext) in fileTypeFilters"
                :key="ext + 'filter'"
                :class="fileTypeFilterButtonClass(fileFilter.status)"
                :title="fileTypeFilterTitleClass(fileFilter, ext)"
                @click="fileFilter.status = !fileFilter.status"
              >
                <span class="file-filter-ext">{{ ext === ':directory:' ? '目录' : ext || '无扩展名' }}</span>
                (
                <span class="file-filter-count">{{ fileFilter.count }}</span>)
              </div>
            </div>
            <div
              v-if="calcing"
              class="file-filter-box"
            >
              <div class="file-type-filter-button">
                文件类型计算中...
              </div>
            </div>
          </div>
        </div>
        <json-viewer
          v-if="file && view === 'pro'"
          :data="file.getInfo(false)"
        />
        <div
          v-show="view==='search'"
          class="file-search-panel-box"
        >
          <div class="file-detail-name">
            文件搜索
          </div>
          <div style="padding: 20px 0;">
            <div>
              <input
                ref="fileSearchInput"
                placeholder="输入要搜索的文件名"
                class="file-search-input"
                @input="handleSearchInput"
                @keypress.enter="handleSearch"
              >
            </div>
            <div
              class="file-dirinfo-box"
              style="margin-top: 25px; padding-top: 20px;"
            >
              <div class="file-detail-name">
                配置项
              </div>
              <div style="display: flex; justify-content: center; margin-top: 20px;">
                <div
                  v-for="(item, name) in searchOptions"
                  :key="`${name}status`"
                  style="font-size: 12px;"
                  :class="searchControlButtonClass(item)"
                  @click="item.status = !item.status"
                >
                  <span>{{ item.label }}</span>
                  <span style="padding: 0 5px;">
                    <svg-icon :icon-class="item.icon || ''" />
                  </span>
                </div>
              </div>
            </div>
            <div
              class="file-dirinfo-box"
              style="margin-top: 15px; padding-top: 20px;"
            >
              <div class="file-detail-item">
                <div>当前目录:</div>
                <div>{{ dir }}</div>
              </div>
              <div class="file-detail-item">
                <div>项目总数:</div>
                <div>{{ fileList.length }}</div>
              </div>
            </div>
            <div
              v-if="searchValue"
              class="file-dirinfo-box"
              style="margin-top: 25px; padding-top: 20px;"
            >
              <div class="file-detail-name">
                搜索结果
              </div>
              <div style="display: flex; justify-content: center; margin-top: 10px; font-size: 13px;">
                <div>在{{ fileList.length }}个项目里找到了{{ visibleList.length }}条结果</div>
              </div>
            </div>
            <div
              v-if="visibleList.length"
              class="file-dirinfo-box"
              style="margin-top: 10px; padding-top: 20px;"
            >
              <div
                class="file-detail-name"
                style="user-select: none;"
                title="单击下列项目选择过滤指定的文件类型，右键单击此处可查看菜单"
                @contextmenu.prevent="fileFiltersContextmenu"
              >
                类型过滤器
              </div>
              <div
                v-if="!calcing"
                class="file-filter-box"
                @contextmenu.prevent="fileFiltersContextmenu"
              >
                <div
                  v-for="(fileFilter, ext) in fileTypeFilters"
                  :key="ext + 'filter'"
                  :class="fileTypeFilterButtonClass(fileFilter.status)"
                  :title="fileTypeFilterTitle(fileFilter, ext)"
                  @click="fileFilter.status = !fileFilter.status"
                >
                  <span class="file-filter-ext">{{ ext === ':directory:' ? '目录' : ext || '无扩展名' }}</span>
                  (
                  <span class="file-filter-count">{{ fileFilter.count }}</span>)
                </div>
              </div>
              <div
                v-if="calcing"
                class="file-filter-box"
              >
                <div class="file-type-filter-button">
                  文件类型计算中...
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="file && view === 'file'"
          class="file-info-head"
        >
          <div class="file-icon-box">
            <svg-icon
              class="file-icon"
              :icon-class="file.iconClass || ''"
            />
          </div>
          <div class="file-detail-name">
            {{ file.name }}
          </div>
        </div>
        <div
          v-if="file && view === 'file'"
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
                未计算
              </div>
            </div>

            <div
              v-if="!file.isDir && file.ext"
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
      </vue-scroll>
    </div>
    <div class="file-info-toolbar">
      <div
        v-for="(item, idx) in controlButtons"
        :key="`controlbtn${idx}`"
      >
        <div
          :style="item.style || ''"
          :class="controlButtonClass(item)"
          :title="item.title"
          @click="item.handler"
        >
          <span style="padding: 0 5px;">
            <svg-icon :icon-class="item.icon" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jsonViewer from 'components/jsonViewer.vue'

export default {
  components: {
    jsonViewer
  },
  props: {
    file: {
      type: Object,
      default: () => {}
    },
    fileList: {
      type: Array,
      default: () => []
    },
    selectedFiles: {
      type: Array,
      default: () => []
    },
    dir: {
      type: String,
      default: ''
    },
    visibleList: {
      type: Array,
      default: () => []
    },
    searchValue: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      view: 'file',
      dirCount: 0,
      fileCount: 0,
      sizeTotal: 0,
      calcing: false,
      searchInputTimeout: 0,
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
      }),
      controlButtons: [
        {
          title: '切换到文件一般信息显示',
          view: 'file',
          label: '文件信息',
          icon: 'view',
          handler: () => {
            this.view = 'file'
          }
        },
        {
          title: '切换到文件高级信息显示',
          view: 'pro',
          label: '高级视图',
          icon: 'detail',
          handler: () => {
            this.view = 'pro'
          }
        },

        {
          title: '切换到目录视图显示',
          view: 'dir',
          label: '目录视图',
          icon: 'dir-view',
          handler: () => {
            this.view = 'dir'
          }
        },

        {
          title: '显示文件搜索面板',
          view: 'search',
          label: '搜索文件',
          icon: 'pro-view',
          handler: () => {
            this.view = 'search'
            this.$nextTick(() => {
              this.$refs.fileSearchInput.focus()
            })
          }
        },

        {
          title:
            '将当前项目取消选择（快捷方式：CTRL + 鼠标左键单击列表中已选中的项目）',
          label: '取消选择',
          icon: 'unselect-file',
          handler: () => this.$emit('unselectFile', this.file)
        }
      ],
      searchOptions: {
        caseSensitive: { status: false, label: '区分大小写', icon: 'caseSensitive' },
        congruent: { status: false, label: '全等', icon: 'congruent' },
        regexp: { status: false, label: '正则表达式', icon: 'regexp' }
      }
    }
  },
  computed: {
    // 文件类型过滤器按钮样式
    fileTypeFilterButtonClass () {
      return status => {
        return (
          'file-type-filter-button' +
          (status === true ? ' file-type-filter-enabled' : '')
        )
      }
    },

    // 文件类型过滤器标题
    fileTypeFilterTitle () {
      return (fileFilter, ext) => {
        const type = ext === ':directory:' ? '目录' : ext || '无扩展名文件'
        const status = fileFilter.status === true ? '已显示' : '已过滤'
        return `项目类型：${type}; 项目数量：${fileFilter.count}; ${status}`
      }
    },

    // 控制按钮样式
    controlButtonClass () {
      return item => {
        return (
          'control-button' +
          (this.view === item.view ? ' control-button-actived' : '') +
          (!this.file && !item.view ? ' control-button-disalbed' : '') +
          (this.file && item.icon === 'unselect-file'
            ? ' control-button-warning'
            : '')
        )
      }
    },

    // 搜索控制按钮样式
    searchControlButtonClass () {
      return item => {
        return 'control-button' +
        (item.status ? ' control-button-actived' : '')
      }
    }
  },
  watch: {
    // 计算目录及文件信息
    visibleList (fileList) {
      if (this.searchValue) this.filterCalculator(fileList)
      else this.filterCalculator(this.fileList)
    },

    // 监听搜索设置变动，变动则立即进行搜索
    searchOptions: {
      handler: function (val) {
        this.handleSearch()
      },
      deep: true
    },

    // 文件类型过滤器更改
    fileTypeFilters (filters) {
      this.$emit('filterChange', filters)
    }
  },
  methods: {
    // 文件类型过滤器计算器（扩展名、数量、状态等）
    filterCalculator (fileList) {
      let dirCount = 0
      let fileCount = 0
      let sizeTotal = 0
      const filters = {}
      this.calcing = true
      for (const file of fileList) {
        if (file.isDir) dirCount++
        if (file.isFile) fileCount++
        sizeTotal += file.size || 0

        if (!file.ext && file.isDir) continue
        if (file.ext in filters) filters[file.ext].count++
        else filters[file.ext] = { count: 1, status: true }
      }
      this.dirCount = dirCount
      this.fileCount = fileCount
      this.sizeTotal = sizeTotal
      if (dirCount > 0) {
        filters[':directory:'] = { status: true, count: dirCount }
      }
      this.fileTypeFilters = filters
      this.calcing = false
    },

    // 输入框输入事件
    handleSearchInput () {
      // 文件较多时采用延时搜索，防止性能大量消耗
      if (this.fileList.length > 200) {
        if (this.searchInputTimeout) clearTimeout(this.searchInputTimeout)
        this.searchInputTimeout = setTimeout(() => {
          this.handleSearch()
        }, 300)
        // 少量文件时搜索时间往往在数十毫秒左右，无需优化
      } else { this.handleSearch() }
    },

    // 搜索处理
    handleSearch () {
      this.$nextTick(() => {
        const { value } = this.$refs.fileSearchInput
        this.$emit('searchFile', Object.assign({ value }, this.searchOptions))
      })
    },

    // 文件过滤器右键上下文菜单
    fileFiltersContextmenu (event) {
      // 菜单项处理函数
      const handleFilter = (handle, status) => {
        const filters = this.fileTypeFilters
        for (const key in filters) {
          const filter = filters[key]
          switch (handle) {
            case 'all':
              filter.status = status
              break
            case 'reverse':
              filter.status = !filter.status
              break
            case 'allFiles':
              if (key !== ':directory:') filter.status = status
              break
            case 'allDirs':
              if (key === ':directory:') filter.status = status
              break
          }
        }
        this.fileTypeFilters = filters
      }

      // 所有过滤器都是某个状态吗？
      const not = status => {
        return !(
          Object.values(this.fileTypeFilters).filter(
            filter => filter.status === status
          ).length > 0
        )
      }

      // 设置右键菜单
      this.$contextmenu({
        items: [
          {
            label: '过滤全部项目',
            disabled: not(true),
            onClick: () => {
              handleFilter('all', false)
            }
          },
          {
            label: '取消过滤全部',
            divided: true,
            disabled: not(false),
            onClick: () => {
              handleFilter('all', true)
            }
          },
          {
            label: '过滤全部文件',
            disabled: not(true),
            onClick: () => {
              handleFilter('allFiles', false)
            }
          },
          {
            label: '取消过滤文件',
            disabled: not(false),
            divided: true,
            onClick: () => {
              handleFilter('allFiles', true)
            }
          },
          {
            label: '过滤全部目录',
            disabled: not(true),

            onClick: () => {
              handleFilter('allDirs', false)
            }
          },
          {
            label: '取消过滤目录',
            disabled: not(false),

            divided: true,
            onClick: () => {
              handleFilter('allDirs', true)
            }
          },
          {
            label: '反选',
            onClick: () => {
              handleFilter('reverse')
            }
          }
        ],
        event,
        zIndex: 3,
        minWidth: 100
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../themes/light.less";
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
  position: relative;
  border-left: 1px dashed #d5d8e3;
  min-width: 300px;
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
  word-wrap: normal;
  word-break: break-all;
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
  justify-content: space-around;
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

.file-detail-dir-view {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-dirinfo-box {
  border-top: 1px dashed #d5d8e3;
  padding: 5px 0;
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
  transition: 0.2s ease;
}

.file-type-filter-button:hover {
  filter: brightness(0.9);
}

.file-type-filter-button:active {
  filter: brightness(0.8);
}

.file-type-filter-enabled {
  background-color: #b2dfdb;
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

.file-info-toolbar {
  position: absolute;
  display: flex;
  bottom: 0;
  height: 60px;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-top: 1px dashed #d5d8e3;
}

.file-search-panel-box {
  padding: 10px;
}

.file-search-input {
  transition: 0.2s ease;
  width: 100%;
  outline: none;
  height: 40px;
  background: #F1F1F1;
  border: 2px solid #F1F1F1;
  padding: 8px;
  border-radius: 4px;
}

.file-search-input:hover {
  border-color: #7A94FF;
}
.file-search-input:focus {
  border-color: #7A94FF;
}
</style>
