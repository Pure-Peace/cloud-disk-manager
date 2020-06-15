<template>
  <label class="custom-toggle">
    <input
      v-model="model"
      type="checkbox"
      v-bind="$attrs"
      v-on="$listeners"
    >
    <span class="custom-toggle-slider rounded-circle" />
  </label>
</template>
<script>
export default {
  name: 'BaseSwitch',
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false,
      description: 'Switch value'
    }
  },
  computed: {
    model: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "../themes/light.less";

label {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  cursor: default;
}

.custom-toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 1.7rem;

  input {
    display: none;

    &:checked {
      + .custom-toggle-slider {
        border: 1px solid @primary;

        &:before {
          background: @primary;
          transform: translateX(1.825rem);
        }
      }
    }

    &:disabled {
      + .custom-toggle-slider {
        border: 1px solid @disabled-color;
      }

      &:checked {
        + .custom-toggle-slider {
          border: 1px solid @disabled-color;

          &:before {
            background-color: lighten(@disabled-color, 10%);
          }
        }
      }
    }
  }
}

.custom-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid @disabled-color;
  border-radius: 34px !important;
  background-color: transparent;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    border-radius: 50% !important;
    background-color: @disabled-color;
    transition: 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
}
</style>
