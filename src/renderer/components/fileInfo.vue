<template>
  <div class="file-detail-box">
    <vue-scroll :ops="scrollBarOptions">
      <div v-if="file">
        <div class="file-detail-item">
          <div class="file-detail-name">
            {{ file.name }}
          </div>
        </div>
        <div class="file-detail-content">
          <div class="file-detail-item">
            <div>类型</div>
            <div>{{ utils.getFileType (file) }}</div>
          </div>

          <div class="file-detail-item">
            <div>大小</div>
            <div v-if="file.size">
              {{ utils.sizeFormat(file.size) }}
            </div>
            <div v-else>
              未计算
            </div>
          </div>

          <div
            v-if="file.ext"
            class="file-detail-item"
          >
            <div>文件后缀</div>
            <div>{{ file.ext }}</div>
          </div>
        </div>
        <div class="file-detail-content">
          <div
            class="file-detail-item"
          >
            <div>所在目录</div>
            <div>{{ file.dir }}</div>
          </div>

          <div
            class="file-detail-item"
          >
            <div>完整路径</div>
            <div>{{ file.path }}</div>
          </div>
        </div>
        <div class="file-detail-content">
          <div
            v-for="(time, key) in utils.fileTimes(file)"
            :key="`file${key}`"
            class="file-detail-item"
          >
            <div>{{ utils.timeTitleFormat(key) }}</div>
            <div>{{ utils.timeFormat(time) }}</div>
          </div>
        </div>
      </div>
      <div v-show="!file">
        请选择文件
      </div>
    </vue-scroll>
  </div>
</template>

<script>
import utils from 'components/utils.js'

export default {
  props: {
    file: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      utils,
      scrollBarOptions: this.$bus.mixinScrollBarOptions()

    }
  }
}
</script>

<style lang="less" scoped>
@import '../themes/light.less';

.file-detail-box {
  flex: 1;
  background-color: #f1f2f6;
  padding: 10px;
}

.file-detail-content {
    margin-top: 15px;
    padding: 15px;
        background-color: #E8EAF6;

}

.file-detail-name {
    border-radius: 4px;
    padding: 5px;
    background-color: #E8EAF6;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.file-detail-item {
  display: flex;
  font-size: 13px;
  margin: 5px 0;
  flex-wrap: wrap;
  :first-child {
    white-space: nowrap;
        border-radius: 4px;
    background-color: @primary;
    color: #FFFFFF;
    display: flex;
    align-self: baseline;
    padding: 4px 8px;

  }
  :last-child {
    white-space: pre-wrap;
    word-wrap: normal;
    word-break: break-all;
    margin: 4px 8px;
  }
}

div {
    user-select: text;
}
</style>
