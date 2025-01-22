const { Router } = require("express");
const router = Router();
const uploader = require("../app/middlewares/uploader.middleware");
const { setPath } = require("../app/middlewares/art.middleware");
const { getUser } = require("../app/middlewares/auth.middleware");
const {
  create,
  index,
  userArts,
  show,
  edit,
  like,
  remove,
} = require("../app/controllers/art.controller");
const convertToWebP = require("../app/middlewares/converter.middleware");

router.get("/user/:id", userArts);
router.post(
  "/create",
  getUser,
  setPath,
  uploader.single("image"),
  convertToWebP,
  create
);

router.post("/:slug", getUser, like);

router.get("/", index);
router.get("/:slug", show);
router.put("/:slug", getUser, edit);
router.delete("/:slug", getUser, remove);

module.exports = router;
