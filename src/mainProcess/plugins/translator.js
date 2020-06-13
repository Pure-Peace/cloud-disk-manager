import i18n from '../../i18n'

class Translator {
  constructor (locale, messages, fallbackLocale) {
    this.locale = locale || i18n.locale
    this.messages = messages || i18n.messages
    this.fallbackLocale = fallbackLocale || i18n.fallbackLocale
  }

  // 改变翻译器语言
  changeLang (locale) {
    this.locale = locale
  }

  // 获取翻译函数（为了保持this正确指向）
  // Get the translation function (to keep this pointed to correctly)
  get () {
    return (i) => { return this.$t(i) }
  }

  // 翻译函数
  // Translation function
  $t (original) {
    function $query (trans) {
      for (let i = 0; i < textList.length; i++) {
        const key = textList[i]
        if (typeof (trans) === 'object') trans = trans[key]
      }
      return trans || original
    }
    const textList = original.split('.')
    let re = $query(this.messages[this.locale])
    if (re === original) re = $query(this.messages[this.fallbackLocale])
    return re
  }
}

export default Translator
