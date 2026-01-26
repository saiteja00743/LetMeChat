const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config();
connectDB();
const app = express();

// IMPORTANT: Parse JSON and enable CORS FIRST
app.use(express.json()); // to accept json data

// CORS configuration - Allow both localhost and IP
const allowedOrigins = [
    'http://localhost:5173',
    'http://10.75.221.145:5173',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in development
        }
    },
    credentials: true,
}));

// Security Middleware - TEMPORARILY DISABLED
// app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Rate limiting - TEMPORARILY DISABLED due to compatibility issue
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     message: "Too many requests from this IP, please try again later",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 5,
//     message: "Too many login attempts, please try again later",
//     skipSuccessfulRequests: true,
// });

// app.use("/api/user/login", authLimiter);
// app.use("/api/user/register", authLimiter);
// app.use("/api/", limiter);

const path = require("path");

// ... existing code ...

const __dirname1 = path.resolve(__dirname, "..");

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/client/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });
}

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api", require("./routes/uploadRoutes"));

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*", // In production, specify the client URL
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("message deleted", (data) => {
        const { messageId, chatId, users, senderId } = data;
        if (!users) return;
        users.forEach((user) => {
            if (user._id === senderId) return;
            socket.in(user._id).emit("message deleted received", { messageId, chatId });
        });
    });

    socket.on("message edited", (updatedMessage) => {
        const chat = updatedMessage.chat;
        if (!chat.users) return;
        chat.users.forEach((user) => {
            if (user._id === updatedMessage.sender._id) return;
            socket.in(user._id).emit("message edited received", updatedMessage);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
