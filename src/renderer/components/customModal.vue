<template>
  <modal
    :adaptive="true"
    :name="name"
    :click-to-close="clickToClose"
    @before-open="handleBeforeOpen"
    @before-close="handleBeforeClose"
  >
    <slot v-if="type === 'normal'">
      {{ content }}
    </slot>
    <div slot="top-right">
      <button
        class="close-button"
        @click="$modal.hide(name)"
      >
        <svg-icon icon-class="exit" />
      </button>
    </div>
    <app-about v-show="type === 'appAbout'" />
    <add-ftp v-show="type === 'addFtp'" />
  </modal>
</template>

<script>
import appAbout from 'components/modalContents/appAbout.vue'
import addFtp from 'components/modalContents/addFtp.vue'

export default {
  components: {
    appAbout,
    addFtp
  },
  props: {
    content: {
      default: '',
      type: String
    },
    name: {
      default: '',
      type: String
    },
    clickToClose: {
      default: true,
      type: Boolean
    }
  },
  data () {
    return {
      openTime: 0,
      type: 'normal'
    }
  },
  methods: {
    handleBeforeOpen (e) {
      this.openTime = Date.now()
      this.type = (e && e.params.type) || 'normal'
    },
    handleBeforeClose (e) {
      if (Date.now() - this.openTime < 500) e.cancel()
    }
  }

}
</script>

<style lang="less" scoped>
.close-button {
    font-size: 30px;
    color: #FFFFFF;
    padding: 15px;
}

.close-button:hover {
    filter: brightness(.8);
}
</style>
