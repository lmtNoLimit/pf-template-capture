const fs = require('fs')
const sizeOf = require('image-size')
const { getTemplates } = require('./takeScreenshots')
const { ImageURL, TemplateImageURL, NEW_TEMPLATES, TEMPLATES_TYPES } = require('./constant')


const getTemplatesData = async () => {
  let templates = await getTemplates()
  templates = templates.map((n) =>
    n.includes('demo#') ? n.replace('demo#', '') : n
  )
  return templates.map((template) => {
    return {
      name: template,
      height: {
        desktop: sizeOf(`optimized/${template}_desktop.png`).height,
        mobile: sizeOf(`optimized/${template}_mobile.png`).height,
      },
      isNew: NEW_TEMPLATES.includes(template),
      types: ['homepage'],
    }
  })
}

const generateTemplatesData = (data) => {
  return data.map(({ name, height, types, isNew }) => ({
    preview: `${ImageURL}${name}.png`,
    previewDesktop: {
      src: `${TemplateImageURL}/${name}`,
      height: height.desktop,
    },
    previewMobile: {
      src: `${TemplateImageURL}/${name}`,
      height: height.mobile,
    },
    new: isNew,
    name: name[0].toUpperCase() + name.slice(1),
    json: `/templates/${name}/data.json`,
    html: `/templates/${name}/index.html`,
    type: types
  }))
}

const writeTemplatesData = (filePath, data) => {
  const obj = generateTemplatesData(data)
  let dataStr = JSON.stringify(obj, null, 4)
  fs.writeFileSync(filePath, dataStr)
}

const run = async () => {
  const data = await getTemplatesData()
  writeTemplatesData('data.json', data)
  process.exit()
}

