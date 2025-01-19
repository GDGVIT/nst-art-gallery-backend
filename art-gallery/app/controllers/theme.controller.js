const Art = require("../../models/art");
const Theme = require("../../models/theme");
const deleteFile = require("../utils/delete_file");
const slugify = require("../utils/slugify");
const fs = require("fs");

const index = async (req, res) => {
  try {
    const themes = await Theme.find();
    return res.status(200).json({
      status: "success",
      message: "Themes Fetched Successfully.",
      themes: themes,
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

const show = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Slug is required",
      });
    }
    const theme = await Theme.findOne({ slug });

    if (!theme) {
      return res.status(404).json({
        status: "error",
        message: "Theme not found.",
      });
    }
    const arts = await Art.find({ theme: theme._id })
      .populate({ path: "artist", select: "id name" })
      .exec();

    return res.status(200).json({
      status: "success",
      message: "Theme fetched successfully.",
      theme: theme,
      arts: arts,
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    let slug = slugify(name);
    let i = 0;
    while (await Theme.findOne({ slug: slug })) {
      slug = slugify(name, ++i);
    }
    let image = "";
    if (req.file) {
      let oldFilename = req.file.filename;
      let extension = oldFilename.split(".")[oldFilename.split(".").length - 1];
      image = slug + "." + extension;
      fs.rename(
        req.file.path,
        req.file.destination + "/" + image,
        function (err) {
          if (err) {
            throw new Error("Error renaming file. Error: " + err);
          }
        }
      );
      image = "/images/theme/" + image;
    } else {
      return res.status(400).json({
        status: "error",
        message: "Image is required",
      });
    }
    const theme = await Theme.create({
      name,
      description,
      slug,
      image,
      description,
    });
    return res.status(200).json({
      status: "success",
      message: "Theme added successfully.",
    });
  } catch (e) {
    if (req.file) {
      fs.existsSync(req.file.path) && deleteFile(req.file.path);
    }
    return res.status(500).json({
      status: "error",
      message: "Error adding theme. Error: " + e,
    });
  }
};

const edit = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, description } = req.body;
    let theme = await Theme.findOne({ slug });
    if (!theme) {
      return res
        .status(404)
        .json({ status: "error", message: "Theme not found" });
    }

    if (name) {
      theme.name = name;
    }
    if (description) {
      theme.description = description;
    }

    if (req.file) {
      let oldFilename = req.file.filename;
      let extension = oldFilename.split(".")[oldFilename.split(".").length - 1];
      let image = slug + "." + extension;
      fs.rename(
        req.file.path,
        req.file.destination + "/" + image,
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ status: "error", message: "File rename error" });
          }
        }
      );
      theme.image = image;
    }

    await theme.save();
    res.status(200).json({
      status: "success",
      message: "Theme updated successfully",
      theme,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
const destroy = async (req, res) => {
  try {
    const { slug } = req.params;
    let theme = await Theme.findOne({ slug });

    if (!theme) {
      return res
        .status(404)
        .json({ status: "error", message: "Theme not found" });
    }

    // if (theme.image) {
    //   fs.unlink(`path/to/images/${theme.image}`, (err) => {
    //     if (err) {
    //       return res
    //         .status(500)
    //         .json({ status: "error", message: "File deletion error" });
    //     }
    //   });
    // }

    await Theme.findByIdAndDelete(theme.id);
    res
      .status(200)
      .json({ status: "success", message: "Theme deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
// TODO: Select a random theme for theme of the day

module.exports = { index, show, create, edit, destroy };
