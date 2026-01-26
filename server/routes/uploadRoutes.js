const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = "chat-attachments";
        let resourceType = "auto";

        if (file.mimetype.startsWith("video/")) {
            resourceType = "video";
        } else if (file.mimetype.startsWith("audio/")) {
            resourceType = "video"; // Cloudinary uses 'video' for audio
        } else if (file.mimetype.startsWith("image/")) {
            resourceType = "image";
        } else if (file.mimetype === "application/pdf" || file.mimetype.includes("document")) {
            resourceType = "auto"; // Let Cloudinary handle it, but allow all
        }

        return {
            folder: folder,
            resource_type: resourceType,
            // Remove allowed_formats for documents to allow Cloudinary to handle raw files better
            // allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "mp4", "mp3", "wav", "webp"],
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Upload endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        res.json({
            url: req.file.path,
            filename: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
        });
    } catch (error) {
        console.error("UPLOAD ERROR DETAILS:", error);
        res.status(500).json({
            message: "File upload failed",
            error: error.message,
            hint: "Check server console for UPLOAD ERROR DETAILS"
        });
    }
});

module.exports = router;
