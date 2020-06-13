<template>
  <div
    id="leftbar-box"
    :style="`width: ${$bus.leftbarWidth}px`"
  >
    <div class="leftbar-topline" />
    <div class="leftbar-top-menu">
      <circle-button
        icon="cloud-outline"
        @click.native="changePage()"
      />
      <circle-button icon="list" />
    </div>
    <div class="leftbar-bottom-menu">
      <circle-button
        icon="setting"
        type="shadow"
      />
      <circle-button
        icon="info"
        type="shadow"
      />
    </div>
  </div>
</template>

<script>
import circleButton from '@/components/circleButton.vue'

export default {
  components: {
    circleButton
  },
  props: {
    win: {
      default: () => {},
      type: Object
    }
  },
  methods: {
    changePage (pageName) {
      this.$router.push({ name: pageName })
    }
  }

}
</script>

<style lang="less" scoped>
@import '../themes/light.less';

#leftbar-box {
    height: 100%;
    user-select: none;
    flex-direction: column;
    display: flex;

}

.leftbar-top-menu {
    display: flex;
    flex-direction: column;
    padding: 15px 10px 0 10px;
    align-items: center;
    flex: 1;
    :not(:first-child) {
        margin-top: 10px;
    }
}

.leftbar-bottom-menu {
    display: flex;
    flex-direction: column;
    padding: 0 10px 20px 10px;
    align-items: center;
    :not(:first-child) {
        margin-top: 8px;
    }
}

.leftbar-topline {
    height: 2px;
    width: 20px;
    background-color: @primary;
    margin: 5px auto;
    filter: brightness(1.6);
    opacity: .5;
}
</style>
