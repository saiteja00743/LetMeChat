const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        isEdited: { type: Boolean, default: false },
        // File attachment fields
        attachmentType: {
            type: String,
            enum: ['image', 'video', 'audio', 'document', 'other', null],
            default: null
        },
        attachmentUrl: { type: String },
        attachmentName: { type: String },
        attachmentSize: { type: Number }, // in bytes
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
