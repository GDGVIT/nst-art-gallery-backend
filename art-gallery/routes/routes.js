const { Router } = require("express");
const router = Router();

const auth = require("./auth.routes");
const theme = require("./theme.routes");
const art = require("./art.routes");

router.use("/auth", auth);
router.use("/theme", theme);
router.use("/art", art);

module.exports = router;
