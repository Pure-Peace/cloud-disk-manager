import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// 读取语言文件夹下所有的翻译文件及内容
// Read all translation files and content in the language folder
function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

export default new VueI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  // 可以在vue页面中使用 console.log(this.$i18n.messages) 看到读取到的翻译内容
  // You can use console.log (this.$i18n.messages) in the vue page to see the translations read
  messages: loadLocaleMessages()
})
