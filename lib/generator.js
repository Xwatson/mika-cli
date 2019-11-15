const Metalsmith = require('metalsmith') // 静态站点生成器
const Handlebars = require('handlebars') // 模板引擎
const rm = require('rimraf').sync

module.exports = (metadata = {}, src, dest = '.') => {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }

  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmith, done) => {
      	const meta = metalsmith.metadata()
        Object.keys(files).forEach(fileName => {
          if (fileName === 'package.json') { // 仅对package.json处理
            const t = files[fileName].contents.toString()
            files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta.metadata))
          }
        })
      	done()
      }).build(err => {
      	rm(src)
      	err ? reject(err) : resolve(metadata)
      })
  })
}
