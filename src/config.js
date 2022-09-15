const getLocationOrigin = () => {
  return (
    window.location.protocol +
    '//' +
    window.location.hostname +
    (window.location.port ? ':' + window.location.port : '')
  )
}

const companyName = '科研仪器使用登记管理'
const version = 'V11.3.3'
const baiduKey = '百度key'

export default {
  version,
  companyName,
  getLocationOrigin,
  baiduKey
}
