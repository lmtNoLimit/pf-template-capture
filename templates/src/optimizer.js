const fs = require('fs')
const resizeOptimizeImages = require('resize-optimize-images')
const tinify = require('tinify')
const {TINIFY_KEY} = require('../config')
tinify.key = TINIFY_KEY

// optimize image first time to make image under 5MB
module.exports.optimizeImage = async (imageName, width, quality) => {
  const options = {
    images: [`screenshots/${imageName}`],
    width: width,
    quality: quality,
  }
  await resizeOptimizeImages(options)
  console.log(`1.optimized ${imageName}`)
}

module.exports.optimizeImages = async () => {
    if (!fs.existsSync('screenshots')) {
        return 'Directory not found'
    }
    const images = fs.readdirSync('screenshots')
    for (let image of images) {
        await optimizeImage(image, OPTIMIZE_WIDTH, OPTIMIZE_QUALITY)
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
module.exports.tinifyImages = async () => {
  if (!fs.existsSync('optimized')) {
    fs.mkdirSync('optimized')
  }
  const images = fs.readdirSync('screenshots')

  for (const image of images) {
    if (!image.includes('png')) {
      continue
    }
    await tinify
      .fromFile(`screenshots/${image}`)
      .toFile(`optimized/${image}`)
      .then(() => console.log(`2.optimized ${image}`))
  }
}
