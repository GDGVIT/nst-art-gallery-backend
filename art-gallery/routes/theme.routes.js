const { Router } = require("express");
const uploader = require("../app/middlewares/uploader.middleware");
const {
  index,
  show,
  create,
  edit,
  destroy,
} = require("../app/controllers/theme.controller");
const convertToWebP = require("../app/middlewares/converter.middleware");
const { verify, setPath } = require("../app/middlewares/theme.middleware");

const router = Router();

router.get("/", index);
router.get("/:slug", show);
router.post(
  "/create",
  verify,
  setPath,
  uploader.fields([
    { name: "theme_image", maxCount: 4 },
    { name: "work_image", maxCount: 2 },
  ]),
  convertToWebP,
  create
);
router.put(
  "/:slug",
  verify,
  setPath,
  uploader.fields([
    { name: "theme_image", maxCount: 4 },
    { name: "work_image", maxCount: 2 },
  ]),
  convertToWebP,
  edit
);
router.delete("/:slug", verify, destroy);

module.exports = router;
