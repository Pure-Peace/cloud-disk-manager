<template>
  <div
    v-drag
    class="float-button-box"
  >
    <div
      class="float-button"
      :title="title"
      @click="handleClick"
    >
      <span :style="floatButtonIconStyle">
        <svg-icon
          :class="floatButtonIconClass"
          :icon-class="menuOpened ? 'button-exit' : icon"
        />
      </span>
    </div>
    <slot />
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
    },
    title: {
      type: String,
      default: '单击展开菜单，按住可进行拖动'
    },
    menuOpened: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  computed: {
    floatButtonIconStyle () {
      return `font-size: ${this.size}px;`
    },

    floatButtonIconClass () {
      return 'float-button-icon' + (this.menuOpened ? ' float-button-icon-menu-opened' : '')
    }
  },
  methods: {
    handleClick (e) {
      if (!moving) {
        this.$emit('click', e)
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
  top: 87%;
  left: 92%;
}

.float-button {
  position: relative;
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

.float-button:hover {
    filter: brightness(1.1);
}

.float-button:active {
    filter: brightness(.9);
}

.float-button-icon {
  transition: .4s ease;
}

.float-button-icon-menu-opened {
  transform: rotate(90deg);
}
</style>
