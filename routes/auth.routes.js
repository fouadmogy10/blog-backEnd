const { register, login, getMe } = require("../Controllers/auth.controller");
const { verifyToken } = require("../middelware/verifyToken");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

module.exports = router;
