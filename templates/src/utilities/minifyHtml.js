const minify = require('html-minifier').minify
const fs = require('fs')

module.exports.minifyHtml = async function (path, callback) {
  const files = fs.readdirSync(path)
  files.map((file) => {
    const data = fs.readFileSync(`${path}/${file}`, 'utf8')
    const html = minify(data, {
      minifyCSS: true,
      ignoreCustomFragments: [/<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/],
      continueOnParseError: true,
      removeComments: true,
      removeTagWhitespace: true,
    })
    fs.writeFileSync(`${path}/${file}`, html.toString())
  })
  callback && callback()
}
