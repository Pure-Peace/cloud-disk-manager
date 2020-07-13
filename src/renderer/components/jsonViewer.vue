<template>
  <div class="json-viewer-box">
    <vue-json-pretty
      :data="data"
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

<style scoped>
.json-viewer-box {
    user-select: text !important;
    padding: 20px;
}
</style>

<style>
.vjs-tree {
    user-select: text !important;
}

.vjs-tree__content {
    user-select: text !important;
}
</style>
