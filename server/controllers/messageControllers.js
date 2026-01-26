const asyncHandler = require("express-async-handler");
const Message = require("../models/MessageModel");
const User = require("../models/UserModel");
const Chat = require("../models/ChatModel");

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, attachmentType, attachmentUrl, attachmentName, attachmentSize } = req.body;

    if ((!content && !attachmentUrl) || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        attachmentType,
        attachmentUrl,
        attachmentName,
        attachmentSize,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name avatar");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name avatar email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name avatar email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            res.status(404);
            throw new Error("Message not found");
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("You cannot delete someone else's message");
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const editMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            res.status(404);
            throw new Error("Message not found");
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("You cannot edit someone else's message");
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { content, isEdited: true },
            { new: true }
        ).populate("sender", "name avatar").populate("chat");

        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { sendMessage, allMessages, deleteMessage, editMessage };
