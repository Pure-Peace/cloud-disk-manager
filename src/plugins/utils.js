import moment from 'moment'
const IS_PROD = process.env.NODE_ENV === 'production'
const enableLog = true

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
  log: (text, ...args) => {
    args.unshift('color: green; font-size: 14px;')
    if (!IS_PROD && enableLog) console.info(`%c[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${text}`, ...args || '')
  }
}
