const express = require("express");
const {
    sendMessage,
    allMessages,
    deleteMessage,
    editMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.route("/:messageId").delete(protect, deleteMessage).put(protect, editMessage);

module.exports = router;
