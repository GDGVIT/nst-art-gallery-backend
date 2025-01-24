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
    const { theme_title, theme_description, work_title, work_description } = req.body;
    let slug = slugify(name);
    let i = 0;

    while (await Theme.findOne({ slug: slug })) {
      slug = slugify(name, ++i);
    }

    if (!req.files || !Object.hasOwn(req.files, "theme_image") || !Object.hasOwn(req.files, "work_image")) {
      return res.status(400).json({
        status: "error",
        message: "Image is required",
      });
    }

    let theme_images = [];
    for (img of req.files["theme_image"]) {
      let image = "";

      let oldFilename = img.filename;
      let extension = oldFilename.split(".")[oldFilename.split(".").length - 1];
      image = slug + "." + extension;
      fs.rename(
        img.path,
        img.destination + "/" + image,
        function (err) {
          if (err) {
            throw new Error("Error renaming file. Error: " + err);
          }
        }
      );
      theme_images.push("/images/theme/" + image);
    }

    let work_images = [];
    for (img of req.files["work_image"]) {
      let image = "";

      let oldFilename = img.filename;
      let extension = oldFilename.split(".")[oldFilename.split(".").length - 1];
      image = slug + "." + extension;
      fs.rename(
        img.path,
        img.destination + "/" + image,
        function (err) {
          if (err) {
            throw new Error("Error renaming file. Error: " + err);
          }
        }
      );
      work_images.push("/images/theme/" + image);
    }

    const theme = await Theme.create({
      slug,
      theme_title,
      theme_description,
      theme_images,
      work_images,
      work_description,
      work_title
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
    const { theme_title, theme_description, work_title, work_description } = req.body;
    let theme = await Theme.findOne({ slug });
    if (!theme) {
      return res
        .status(404)
        .json({ status: "error", message: "Theme not found" });
    }

    if (theme_title) {
      theme.theme_title = theme_title;
    }
    if (theme_description) {
      theme.theme_description = theme_description;
    }
    if (work_title) {
      theme.work_title = work_title;
    }
    if (work_description) {
      theme.work_description = work_description;
    }

    if (req.files && Object.hasOwn(req.files, 'theme_image')) {
      let theme_images = [];
      for (file of req.files["theme_image"]) {
        let oldFilename = file.filename;
        let extension = oldFilename.split(".")[oldFilename.split(".").length - 1];
        let image = slug + "." + extension;
        fs.rename(
          file.path,
          file.destination + "/" + image,
          function (err) {
            if (err) {
              return res
                .status(500)
                .json({ status: "error", message: "File rename error" });
            }
          }
        );
        theme_images.push(image);
      }
      theme.theme_images = theme_images;
    }

    if (req.files && Object.hasOwn(req.files, 'work_image')) {
      let work_images = [];

      for (file of req.files["work_image"]) {
        let oldFilename = file.filename;
        let extension = oldFilename.split(".")[oldFilename.split(".").length - 1];
        let image = slug + "." + extension;
        fs.rename(
          file.path,
          file.destination + "/" + image,
          function (err) {
            if (err) {
              return res
                .status(500)
                .json({ status: "error", message: "File rename error" });
            }
          }
        );
        work_images.push(image);
      }
      theme.work_images = work_images;
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
