const mongoose = require("mongoose");
const { Schema } = mongoose;

const ThemeSchema = new Schema({
  theme_title: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  theme_images: [{
    type: String,
    required: true,
  }],
  theme_description: {
    type: String,
    required: true,
  },
  work_title: {
    type: String,
    required: true,
  },
  work_images: [{
    type: String,
    required: true,
  }],
  work_description: {
    type: String,
    required: true,
  },
});

const Theme = mongoose.model("Theme", ThemeSchema);
module.exports = Theme;
