const asyncHandler = require("express-async-handler");
// Force git update for file tracking
const User = require("../models/UserModel");
const generateToken = require("../config/generateToken");
const validator = require("validator");

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        res.status(400);
        throw new Error("Please enter a valid email address");
    }

    // Validate password strength
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters long");
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        avatar,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Failed to Create the User");
    }
});

// Simplified login without lockout for now
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
    });
});

// /api/user?search=piyush
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

// Initialize Google Client
// NOTE: We use a placeholder here. The user must provide the GOOGLE_CLIENT_ID in .env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error("Token ID is required");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // User exists, return token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token: generateToken(user._id),
            });
        } else {
            // User doesn't exist, create new user
            // Generate a random secure password
            const randomPassword = crypto.randomBytes(16).toString("hex");

            user = await User.create({
                name,
                email: email.toLowerCase(),
                password: randomPassword,
                avatar: picture,
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    token: generateToken(user._id),
                });
            } else {
                res.status(400);
                throw new Error("Failed to Create the User");
            }
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401);
        throw new Error("Invalid Google Token");
    }
});

module.exports = { registerUser, authUser, allUsers, updateUserProfile, googleAuth };
