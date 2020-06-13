<template>
  <div>
    <div
      class="locale-changer home-button app-action-button"
      @click="showOptions=!showOptions"
    >
      {{ $t('localeChangerTitle') }} <span style="font-weight: bold;">{{ $i18n.locale }}</span>
    </div>
    <div v-if="showOptions">
      <div
        v-for="(lang, idx) in options"
        :key="idx"
        class="locale-changer home-button app-action-button"
        :class="$i18n.locale===lang?'selected':''"
        @click="changeLang(lang)"
      >
        {{ lang }}
      </div>
    </div>
  </div>
</template>

<script>
const ipc = require('electron').ipcRenderer

export default {
  name: 'LocaleChanger',
  data () {
    return {
      options: this.$i18n.availableLocales,
      showOptions: false
    }
  },
  methods: {
    changeLang (lang) {
      this.$i18n.locale = lang
      ipc.send('appLanguageChange', lang)
      this.showOptions = false
    }
  }
}
</script>

<style scoped>
.selected {
  background-color: #0F8154;
}

.locale-changer {
  width: 120px;
  height: 15px;
  font-size: 12px;
  padding: 10px;
  line-height: 15px;
}
</style>
