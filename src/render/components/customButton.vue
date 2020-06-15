<template>
  <button
    :class="buttonStyle"
    @click="handleClick"
  >
    <span>
      <svg-icon
        v-if="icon"
        :icon-class="icon"
      />
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      default: '',
      type: String
    },
    type: {
      default: 'normal',
      type: String
    },
    text: {
      type: String,
      default: ''
    }
  },
  computed: {
    buttonStyle () {
      let style = 'primary-button'
      if (this.type === 'outline') style = 'outline-button'
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
@import "../themes/light.less";
button {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 4px;
  color: @white;
  background-color: @primary;
  user-select: none;
}

.primary-button {
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.primary-button:hover {
  filter: brightness(1.2);
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.primary-button:active {
  filter: brightness(0.9);
}

.outline-button {
  border: 1px solid @primary;
  background-color: @white;
  color: @primary;
}

.outline-button:hover {
  background-color: @primary;
  color: @white;
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.outline-button:active {
  box-shadow: none;
}
</style>
