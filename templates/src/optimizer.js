const fs = require('fs')
const resizeOptimizeImages = require('resize-optimize-images')
const tinify = require('tinify')
const {TINIFY_KEY, OPTIMIZE_WIDTH, OPTIMIZE_QUALITY} = require('../config')
tinify.key = TINIFY_KEY

// optimize image first time to make image under 5MB
const optimizeImage = async (imageName, width, quality, directory) => {
  const options = {
    images: [`${directory}/${imageName}`],
    width: width,
    quality: quality,
  }
  await resizeOptimizeImages(options)
  console.log(`1.optimized ${imageName}`)
}
module.exports.optimizeImage = optimizeImage
module.exports.optimizeImages = async (directory) => {
    if (!fs.existsSync(directory)) {
        return 'Directory not found'
    }
    const images = fs.readdirSync(directory)
    for (let image of images) {
        await optimizeImage(image, OPTIMIZE_WIDTH['desktop'], OPTIMIZE_QUALITY['desktop'], directory)
    }
}


// optimize specify image
module.exports.tinifyImage = async (image) => {
  if (!fs.existsSync('optimized')) {
    fs.mkdirSync('optimized')
  }
  await tinify
    .fromFile(`screenshots/${image}`)
    .toFile(`optimized/${image}`)
    .then(() => console.log(`2.optimized ${image}`))
}

// optimize all images
module.exports.tinifyImages = async (directory, output) => {
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output)
  }
  const images = fs.readdirSync(directory)
  for (const image of images) {
    if (!image.includes('png')) {
      continue
    }
    await tinify
      .fromFile(`${directory}/${image}`)
      .toFile(`${output}/${image}`)
      .then(() => console.log(`2.optimized ${image}`))
  }
}
