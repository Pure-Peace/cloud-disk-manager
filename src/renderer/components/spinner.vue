<template>
  <div
    v-if="loading"
    :style="spinnerStyle"
    class="spinner-box"
  />
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      parentVisibleHeight: 0,
      parentVisibleWidth: 0
    }
  },
  computed: {
    spinnerStyle () {
      const h = this.parentVisibleHeight
      const w = this.parentVisibleWidth
      return `height: ${h}px; min-height: ${h}px; width: ${w}px; min-width: ${w}px;`
    }
  },
  mounted () {
    console.log(this)
    this.$nextTick(e => {
      this.parentVisibleHeight = this.$parent.$el.clientHeight
      this.parentVisibleWidth = this.$parent.$el.clientWidth
    })
  }
}
</script>

<style scoped>
.spinner-box {
    background-color: red;
    z-index: 999999;
    position: absolute;
}
</style>
