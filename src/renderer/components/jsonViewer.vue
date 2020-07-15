<template>
  <div class="json-viewer-box">
    <div class="json-viewer-title-box">
      <div class="json-viewer-title">
        JSON视图
      </div>
      <div
        class="control-button"
        title="复制JSON数据"
        @click="handleCopyJson"
      >
        <span>{{ title }}</span>
        <span style="padding: 0 5px">
          <svg-icon
            icon-class="copy"
          /></span>
      </div>
    </div>
    <vue-json-pretty
      style="user-select: text !important; margin: 0 10px; overflow: hidden;"
      :data="data"
      :show-select-controller="false"
      :highlight-mouseover-node="true"
      :show-length="true"
    />
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'

export default {
  components: {
    VueJsonPretty
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      title: '复制'
    }
  },
  methods: {
    handleCopyJson () {
      this.$bus.clipboard.writeText(JSON.stringify(this.data))
      this.title = '已复制'
      setTimeout(() => {
        this.title = '复制'
      }, 3000)
    }
  }
}
</script>

<style lang="less" scoped>
@import "../themes/light.less";

.json-viewer-box {
  display: flex;
  flex-direction: column;
}

.json-viewer-title-box {
  display: flex;
  margin: 10px 0;
}

.json-viewer-title {
  padding: 6px 10px;
  background-color: #F1F2F6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}

.control-button {
  white-space: nowrap;
  background-color: #F1F2F6;
  padding: 5px 8px;
  border-radius: 4px;
  transition: .2s ease;
  margin-left: 10px;
  font-size: 12px;
  cursor: pointer;
}

.control-button:hover {
  filter: brightness(.9);
}

.control-button:active {
  filter: brightness(.8);
}
</style>
