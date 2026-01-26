const express = require("express");
const {
    registerUser,
    authUser,
    allUsers,
    updateUserProfile,
    googleAuth,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/google", googleAuth);
router.route("/profile").put(protect, updateUserProfile);

module.exports = router;
