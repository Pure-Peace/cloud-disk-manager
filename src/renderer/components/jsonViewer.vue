<template>
  <div class="json-viewer-box">
    <div class="json-viewer-title-box">
      <div class="json-viewer-title">
        JSON视图
      </div>
    </div>
    <vue-json-pretty
      style="user-select: text !important; margin-left: 20px;"
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
  }
}
</script>

<style lang="less" scoped>
@import "../themes/light.less";

.json-viewer-box {
  display: flex;
  flex-direction: column;
  padding: 15px;
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
}
</style>
