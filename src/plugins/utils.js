import moment from 'moment'
const IS_PROD = process.env.NODE_ENV === 'production'
const enableLog = false

export default {
  moment: () => moment,
  parseUrlSearch: urlSearch => {
    let result = {}
    try {
      if (urlSearch && urlSearch !== '') {
        result = JSON.parse(
        `{"${decodeURI(urlSearch.replace('?', '')
        .replace(/&/g, '","')
        .replace(/=/g, '":"'))}"}`
        )
      }
    } catch {}
    return result
  },
  objectToUrl: obj => {
    const arr = []
    for (const i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]))
      }
    }
    return arr.join('&')
  },
  log: text => {
    if (!IS_PROD && enableLog) console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${text}`)
  }
}
