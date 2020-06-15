export default {
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
  }
}
