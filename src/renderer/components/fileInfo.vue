<template>
  <div class="file-detail-box">
    <div v-if="file">
      <div class="file-detail-info">
        <span>名称:</span>
        <span>{{ file.name }}</span>
      </div>
      <div class="file-detail-info">
        <span>类型:</span>
        <span> {{ utils.getFileType (file) }}</span>
      </div>
      <div
        v-if="file.ext"
        class="file-detail-info"
      >
        <span>文件后缀:</span>
        <span>{{ file.ext }}</span>
      </div>
      <div class="file-detail-info">
        <span>完整路径:</span>
        <span>{{ file.path }}</span>
      </div>
      <div class="file-detail-info">
        <span>所在目录:</span>
        <span>{{ file.dir }}</span>
      </div>

      <div class="file-detail-info">
        <span>大小:</span>
        <span v-if="file.size">{{ utils.sizeFormat(file.size) }}</span>
        <span v-else>未计算</span>
      </div>

      <div
        v-for="(time, key) in utils.fileTimes(file)"
        :key="`file${key}`"
        class="file-detail-info"
      >
        <span>{{ utils.timeTitleFormat(key) }}:</span>
        <span style="margin-left: 5px; padding: 2px 4px;">{{ utils.timeFormat(time) }}</span>
      </div>
    </div>
    <div v-show="!file">
      请选择文件
    </div>
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
      utils
    }
  }
}
</script>
