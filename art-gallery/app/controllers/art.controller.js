const Art = require("../../models/art");
const Theme = require("../../models/theme");
const User = require("../../models/user");
const fs = require("fs");
const slugify = require("../utils/slugify");

const index = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 10;
    const count = await Art.countDocuments();

    const arts = await Art.find()
      .populate({ path: "artist", select: "id name" })
      .populate("theme")
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      status: "success",
      message: "Arts fetched successfully.",
      arts: arts,
      count: count,
    });
  } catch (e) {
    console.log(e);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const userArts = async (req, res) => {
  console.log("hi");

  try {
    let { page, limit } = req.query;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Id is required.",
      });
    }
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }
    page = page || 1;
    limit = limit || 10;
    const count = await Art.countDocuments({ artist: id });
    const arts = await Art.find({ artist: id })
      .populate({ path: "artist", select: "id name" })
      .populate("theme")
      .skip((page - 1) * limit)
      .limit(limit);
    return res.status(200).json({
      status: "success",
      message: "Arts fetched successfully.",
      arts: arts,
      count: count,
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const themeArts = async (req, res) => {
  try {
    let { page, limit } = req.query;
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Slug is required.",
      });
    }
    const theme = await Theme.findOne({ slug });
    if (!theme) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }
    page = page || 1;
    limit = limit || 1;
    const count = await Art.countDocuments();
    const arts = await Art.find({ theme: theme._id })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.status(200).json({
      status: "success",
      message: "Arts fetched successfully.",
      arts: arts,
      count: count,
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const show = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "slug is required.",
      });
    }
    const art = await Art.findOne({ slug: slug })
      .populate("theme")
      .populate({ path: "artist", select: "id name" });
    if (!art) {
      return res.status(404).json({
        status: "error",
        message: "Art not found.",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Art fetched successfully.",
      art: art,
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const like = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "slug is required.",
      });
    }
    const art = await Art.findOne({ slug: slug }).select('+likedBy');

    if (!art) {
      return res.status(404).json({
        status: "error",
        message: "Art not found.",
      });
    }

    if (art.likedBy.includes(userId)) {
      art.likedBy = art.likedBy.filter(id => id.toString() !== userId);
      art.likes = art.likedBy.length;
      await art.save();
      res.status(200).send({
        message: 'Art unliked successfully',
          likes: art.likes,
      });
    } else {
      art.likedBy.push(userId);
      art.likes = art.likedBy.length;
      await art.save();
      res.status(200).send({
        message: 'Art liked successfully',
        likes: art.likes,
      });
    }

  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const create = async (req, res) => {
  try {
    let { title, description, theme } = await req.body;
    if (!theme) {
      return res.status(400).json({
        status: "error",
        message: "Theme is required.",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image is required.",
      });
    }
    if (!title || !description) {
      return res.status(400).json({
        status: "error",
        message: "Title and Description are required.",
      });
    }
    theme = await Theme.findOne({ slug: theme });
    if (!theme) {
      return res.status(404).json({
        status: "error",
        message: "Theme not found.",
      });
    }
    let slug = slugify(title);
    let i = 0;
    while (await Art.findOne({ slug: slug })) {
      slug = slugify(title, ++i);
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
      image = "/images/arts/" + theme.slug + "/" + image;
    }

    theme = theme.id;
    const artist = req.user.id;
    const art = await Art.create({
      title,
      description,
      theme,
      image,
      artist,
      slug,
    });
    return res.status(201).json({
      status: "success",
      message: "Art created successfully.",
      art: art,
    });
  } catch (e) {
    console.log(e);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

const edit = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Slug is required.",
      });
    }
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({
        status: "error",
        message: "Title and Description are required.",
      });
    }
    const art = await Art.findOne({ slug });
    if (req.user.id !== art.artist.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }
    if (!art) {
      return res.status(404).json({
        status: "error",
        message: "Art not found.",
      });
    }
    art.title = title;
    art.description = description;
    await art.save();
    return res.status(200).json({
      status: "success",
      message: "Art updated successfully.",
      art: art,
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

const remove = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Slug is required.",
      });
    }
    const art = await Art.findOne({ slug });
    if (!art) {
      return res.status(404).json({
        status: "error",
        message: "Art not found.",
      });
    }
    if (req.user.id !== art.artist.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }
    await Art.findOneAndDelete({ slug });

    return res.status(200).json({
      status: "success",
      message: "Art removed successfully.",
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

const publish = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Slug is required.",
      });
    }
    const art = await Art.findOne({ slug });
    if (!art) {
      return res.status(404).json({
        status: "error",
        message: "Art not found.",
      });
    }
    if (req.user.id !== art.artist.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    art.published = !art.published;
    await art.save();

    return res.status(200).json({
      status: "success",
      message: "Art published/unpublished successfully.",
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

module.exports = {
  index,
  userArts,
  themeArts,
  show,
  create,
  edit,
  remove,
  like,
  publish,
};
