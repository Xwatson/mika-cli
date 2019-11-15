const download = require('download-git-repo')
const path = require('path')
const ora = require('ora') // 加载等待
const downloadUrl = require('../package.json').tempUrl

module.exports = (target) => {
  target = path.join(target || '.', '.download-temp')
  const spinner = ora(`正在下载项目模板，源地址：${downloadUrl}`)
  spinner.start()
  return new Promise((resolve, reject) => {
    download(`direct:${downloadUrl}#master`,
      target, { clone: true }, (err) => {
        if (err) {
          spinner.fail()
          reject(err)
        } else {
          spinner.succeed()
          resolve(target)
        }
      })
  })
}
