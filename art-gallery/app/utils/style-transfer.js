const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Load content and style images (using sharp to read images).
async function loadImage(imagePath) {
  const imageBuffer = imagePath.buffer;
  const image = await sharp(imageBuffer).removeAlpha().raw().toBuffer();
  const width = (await sharp(imageBuffer).metadata()).width;
  const height = (await sharp(imageBuffer).metadata()).height;
  const imageTensor = tf.tensor3d(image, [height, width, 3]);
  return imageTensor.div(tf.scalar(255)); // Normalize to [0, 1]
}

// Resize style image to 256x256
async function resizeStyleImage(imagePath) {
  const resizedBuffer = await sharp(imagePath.buffer).removeAlpha().resize(256, 256).raw().toBuffer();
  const styleTensor = tf.tensor3d(resizedBuffer, [256, 256, 3]);
  return styleTensor.div(tf.scalar(255)); // Normalize to [0, 1]
}

async function stylizeImages(contentImagePath, styleImagePath) {
  // Load content and style images
  const contentImage = await loadImage(contentImagePath);
  const styleImage = await resizeStyleImage(styleImagePath);

  // Load the style transfer model
  const modelPath = path.resolve(__dirname, "./arbitrary-image-stylization-v1-tensorflow1-256-v2");

  const styleTransferModel = await tf.node.loadSavedModel(modelPath);

  // Stylize the image
  let stylizedImageTensor = await styleTransferModel.predict({
    placeholder: contentImage.expandDims(),
    placeholder_1: styleImage.expandDims(),
  });

  // Save the stylized image
  stylizedImageTensor = stylizedImageTensor["output_0"];
  const unnormal = stylizedImageTensor.mul(tf.scalar(255));
 
  const stylizedImageData = unnormal.dataSync();
  const [height, width, channels] = stylizedImageTensor.shape.slice(1);

  return await sharp(Buffer.from(stylizedImageData), {
    raw: { width, height, channels },
  }).toFormat('jpeg').toBuffer();
}

module.exports = stylizeImages;
