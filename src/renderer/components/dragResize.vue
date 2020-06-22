<template>
  <div
    class="drag-resize"
    @mousedown="dragResize"
  />
</template>

<script>
export default {
  props: {
    element: {
      type: HTMLDivElement,
      default: () => undefined
    }
  },
  data () {
    return {
      resizing: false
    }
  },

  methods: {
    dragResize (e) {
      const clearEvents = e => {
        document.onmouseup = undefined
        document.onmousemove = undefined
        document.onmouseup = undefined
        document.onmouseout = undefined
        document.body.style.cursor = 'auto'
        this.resizing = false
        this.$emit('resized')
      }
      const stopDrag = e => clearEvents(e)
      const initDragEvents = e => {
        document.onmouseleave = () => stopDrag(e)
        document.onmouseup = e => stopDrag(e)
        document.onmousemove = e => {
          const width = this.element.clientWidth
          this.element.style.width = width + e.movementX + 'px'
        }
      }
      this.resizing = true
      this.$emit('resizing')
      document.body.style.cursor = 'ew-resize'
      initDragEvents(e)
    }
  }
}
</script>

<style lang="less" scoped>
.drag-resize {
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
}
</style>
