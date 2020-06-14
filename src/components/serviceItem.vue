<template>
  <div
    class="service-item"
    @click="handleClick"
  >
    <svg-icon
      class="service-item-icon"
      :icon-class="service.name"
    />{{ service.title }}
  </div>
</template>

<script>
export default {
  props: {
    service: {
      default: () => {},
      type: Object
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

.service-item {
  border-radius: 4px;
  border: 1px solid @primary;
  color: @primary;
  background-color: @white;
  padding: 20px 30px;
  font-size: 26px;
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s ease;
}

.service-item:hover {
  background-color: @primary;
  color: @white;
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.service-item:active {
  filter: brightness(.7);
}

.service-item-icon {
  font-size: 40px;
  margin-right: 15px;
}
</style>
