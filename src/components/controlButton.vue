<template>
  <button
    :class="buttonStyle"
    @click="handleClick"
  >
    <svg-icon
      :icon-class="iconClass"
    />
  </button>
</template>

<script>
export default {
  props: {
    iconClass: {
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
      if (this.type === 'warning') style += 'warning-button'
      return style
    }
  },
  methods: {
    handleClick (e) {
      this.$emit('click', e)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../themes/light.less';
button {
    height: 34px;
    width: 34px;
    font-size: 16px;
    border-radius: 4px;
    color: @white;
    background-color: @primary;
    font-size: 16px;
}

button:hover {
    filter: brightness(1.3);
}

button:active {
    filter: brightness(.8);
}

.warning-button:hover {
    background-color: red;
}

.warning-button:active {
    background-color: red;
}

</style>
