<template>
  <div class="file-detail-box">
    <vue-scroll :ops="scrollBarOptions">
      <div v-show="!file">
        请选择文件
      </div>
      <json-viewer
        v-if="file"
        style="user-select: text;"
        :data="file.getInfo(false)"
      />
      <div
        v-if="file"
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
        v-if="file"
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

          <div
            class="file-detail-item"
          >
            <div>完整路径:</div>
            <div>{{ file.path }}</div>
          </div>
        </div>
        <div class="file-detail-content">
          <div
            v-for="timeType in file.timeTypes"
            :key="`file-${timeType}`"
            class="file-detail-item"
          >
            <div>{{ file.timeTypeFormatted(timeType) }}:</div>
            <div>{{ file.timeFormatted(timeType) }}</div>
          </div>
        </div>
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
    file: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      utils,
      scrollBarOptions: this.$bus.mixinScrollBarOptions({
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
  }
}
</script>

<style lang="less" scoped>
@import "../themes/light.less";
.file-icon-box {
  display: flex;
  justify-content: center;
  padding: 20px;
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
}

.file-info-head {
  padding: 10px;
}

.file-detail-item {
  display: flex;
  font-size: 13px;
  flex-wrap: nowrap;
  align-self: baseline;
  justify-content: space-between;

  :not(:first-child) {
    margin: 5px 0;
  }
  :first-child {
    white-space: nowrap;
    border-radius: 4px;
    background-color: #F3F3F3;
    color: #000000;
    display: flex;
    align-self: baseline;
    padding: 4px 8px;
    margin-top: 8px;
    margin-right: 6px;
    letter-spacing: .2px;
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

</style>
