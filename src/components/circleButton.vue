<template>
  <button :class="buttonStyle">
    <svg-icon :icon-class="icon" />
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      default: 'setting',
      type: String
    },
    type: {
      default: 'normal',
      type: String
    }
  },
  computed: {
    buttonStyle () {
      let style = ''
      if (this.type === 'shadow') style += 'shadow-button'
      return style
    }
  }

}
</script>

<style lang="less" scoped>
@import '../themes/light.less';
button {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    color: @primary;
    background-color: @circle-button-background;
    font-size: 26px;
}

button:hover {
    border-radius: 16px;
    color: @circle-button-background;
    background-color: @circle-button-color;
    .svg-icon {
        transform: rotate(60deg);
    }
}

button:active {
    transform: translateY(2px);
}

.shadow-button {
  background-color: @primary;
  color: @white;
  border-radius: 50% !important;
  width: 45px !important;
  height: 45px !important;
  .svg-icon {
      transform: rotate(0) !important;
  }
}
</style>
