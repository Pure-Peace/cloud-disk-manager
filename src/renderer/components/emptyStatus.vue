<template>
  <div
    v-show="show"
    class="empty-box"
  >
    <div class="empty-icon">
      <svg-icon icon-class="empty" />
    </div>
    <div class="empty-text">
      {{ text }}
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: '目录是空的哦'
    }
  }
}
</script>

<style scoped>
.empty-box {
    display: flex;
    color: #303F9F;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: absolute;
}

.empty-icon {
    font-size: 64px;
}

.empty-text {
    font-size: 14px;
}
</style>
