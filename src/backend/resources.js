import axios from './requester'

// 你的接口 / Your interface
export default {
  demoGet () {
    return axios.get('http://example.com/')
      .then(response => response.data)
  },
  demoPost () {
    return axios.post('http://example.com/')
      .then(response => response.data)
  }
}
