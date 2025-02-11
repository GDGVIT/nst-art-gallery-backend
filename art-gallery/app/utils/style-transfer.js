const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Load content image with size limits
async function loadImage(imagePath) {
  const imageBuffer = imagePath.buffer;
  const metadata = await sharp(imageBuffer).metadata();
  
  // Limit maximum dimensions to reduce memory usage
  const MAX_DIM = 1024;
  let width = metadata.width;
  let height = metadata.height;
  
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const image = await sharp(imageBuffer)
    .resize(width, height)
    .removeAlpha()
    .raw()
    .toBuffer();

  const imageTensor = tf.tensor3d(image, [height, width, 3]);
  return imageTensor.div(tf.scalar(255));
}

// Resize style image to smaller dimensions
async function resizeStyleImage(imagePath) {
  const STYLE_DIM = 256; // Reduced from original size if it was larger
  
  const resizedBuffer = await sharp(imagePath.buffer)
    .resize(STYLE_DIM, STYLE_DIM)
    .removeAlpha()
    .raw()
    .toBuffer();

  const styleTensor = tf.tensor3d(resizedBuffer, [STYLE_DIM, STYLE_DIM, 3]);
  return styleTensor.div(tf.scalar(255));
}

async function stylizeImages(contentImagePath, styleImagePath) {
  try {
    // Enable memory logging
    tf.engine().startScope();

    // Load and process images
    const contentImage = await loadImage(contentImagePath);
    const styleImage = await resizeStyleImage(styleImagePath);

    // Load model
    const modelPath = path.resolve(__dirname, "./arbitrary-image-stylization-v1-tensorflow1-256-v2");
    const styleTransferModel = await tf.node.loadSavedModel(modelPath);

    // Process image
    const stylizedImageTensor = await styleTransferModel.predict({
      placeholder: contentImage.expandDims(),
      placeholder_1: styleImage.expandDims(),
    });

    // Post-process result
    const output = stylizedImageTensor["output_0"];
    const unnormal = output.mul(tf.scalar(255));
    const stylizedImageData = unnormal.dataSync();
    const [height, width, channels] = output.shape.slice(1);

    // Clean up tensors
    tf.dispose([contentImage, styleImage, output, unnormal]);
    tf.engine().endScope();

    // Convert to JPEG buffer
    return await sharp(Buffer.from(stylizedImageData), {
      raw: { width, height, channels },
    })
    .jpeg({ quality: 90 })
    .toBuffer();

  } catch (error) {
    console.error('Style transfer error:', error);
    throw error;
  } finally {
    // Ensure memory cleanup
    tf.engine().disposeVariables();
  }
}

module.exports = stylizeImages;
