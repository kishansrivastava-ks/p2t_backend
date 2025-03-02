const express = require("express");
const router = express.Router();
const { getAllUsers, createUser } = require("../controllers/userController");
const validate = require("../middlewares/validate");
const { createUserSchema } = require("../utils/validationSchemas");

router.route("/").get(getAllUsers).post(createUser);

module.exports = router;
