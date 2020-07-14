<template>
  <div
    v-drag
    class="float-button-box"
    @click="test"
  >
    <span :style="floatButtonIconStyle"><svg-icon :icon-class="icon" /></span>
  </div>
</template>

<script>
let moving = false

export default {
  directives: {
    drag (el) {
      el.onmousedown = ev => {
        const disX = ev.clientX - el.offsetLeft
        const disY = ev.clientY - el.offsetTop
        const starX = ev.clientX
        const starY = ev.clientY
        moving = false

        document.onmousemove = ev => {
          let left = ev.clientX - disX
          let top = ev.clientY - disY
          const clientWidth = document.documentElement.clientWidth
          const clientHeight = document.documentElement.clientHeight

          // 横向磁吸，防止横向超出窗口
          if (left < 80) left = 80
          else if (left > clientWidth - el.offsetWidth - 40) { left = clientWidth - el.offsetWidth - 40 }

          // 纵向磁吸，防止纵向超出窗口
          if (top < 70) top = 70
          if (top > clientHeight - el.offsetHeight - 30) { top = clientHeight - el.offsetHeight - 30 }

          if (
            !moving &&
            Math.abs(ev.clientX - starX) + Math.abs(ev.clientY - starY) > 5
          ) { moving = true }
          if (moving) {
            // 更改位置
            el.style.left = (left / clientWidth * 100).toFixed(2) + '%'
            el.style.top = (top / clientHeight * 100).toFixed(2) + '%'
          }
        }

        document.onmouseup = () => {
          document.onmousemove = document.onmouseup = null
        }
      }
    }
  },
  props: {
    icon: {
      type: String,
      default: 'menu'
    },
    size: {
      type: Number,
      default: 22
    }
  },
  data () {
    return {}
  },
  computed: {
    floatButtonIconStyle () {
      return `font-size: ${this.size}px;`
    }
  },
  methods: {
    test () {
      if (!moving) {
        console.log(111)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../themes/light.less";

.float-button-box {
  position: absolute;
  z-index: 50;
  top: 85%;
  left: 90%;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: @primary;
  color: @white;
  cursor: pointer;
  transition: filter .2s ease;
  box-shadow: 0 4px 2px -2px rgba(128, 128, 128, 0.4);
}

.float-button-box:hover {
    filter: brightness(1.1);
}

.float-button-box:active {
    filter: brightness(.9);
}
</style>
