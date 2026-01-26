import { useEffect, useState, useRef } from "react";
import { useChat } from "../context/ChatProvider";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Send, ArrowLeft, Loader2, Info, MessageSquare, X, Check, Smile, Image as ImageIcon, Paperclip, File, Download } from "lucide-react";
import io from "socket.io-client";
import ScrollableChat from "./ScrollableChat";
import EmojiPicker from "emoji-picker-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";

const ENDPOINT = "http://10.75.221.145:5000";
const gf = new GiphyFetch("sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh");
var socket, selectedChatCompare;

import { useTheme } from "../context/ThemeContext";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
    const { isDarkMode } = useTheme();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editContent, setEditContent] = useState("");

    // Emoji, GIF, File states
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearchTerm, setGifSearchTerm] = useState("");
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    const { selectedChat, setSelectedChat, notifications, setNotifications } = useChat();
    const { user } = useAuth();
    const emojiPickerRef = useRef(null);
    const gifPickerRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            setLoading(true);
            const { data } = await API.get(`/message/${selectedChat._id}`);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast.error("Failed to load messages");
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        const messageHandler = (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notifications.includes(newMessageReceived)) {
                    setNotifications([newMessageReceived, ...notifications]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            }
        };

        const deleteHandler = ({ messageId, chatId }) => {
            if (selectedChatCompare?._id === chatId) {
                setMessages((prev) => prev.filter((m) => m._id !== messageId));
            }
        };

        const editHandler = (updatedMessage) => {
            if (selectedChatCompare?._id === updatedMessage.chat._id) {
                setMessages((prev) =>
                    prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
                );
            }
        };

        socket?.on("message received", messageHandler);
        socket?.on("message deleted received", deleteHandler);
        socket?.on("message edited received", editHandler);

        return () => {
            socket?.off("message received", messageHandler);
            socket?.off("message deleted received", deleteHandler);
            socket?.off("message edited received", editHandler);
        };
    }, [fetchAgain, notifications, selectedChat]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (gifPickerRef.current && !gifPickerRef.current.contains(event.target)) {
                setShowGifPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const deleteMessageHandler = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await API.delete(`/message/${messageId}`);
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
            socket.emit("message deleted", {
                messageId,
                chatId: selectedChat._id,
                users: selectedChat.users,
                senderId: user._id,
            });
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    const editMessageHandler = (message) => {
        setEditingMessage(message);
        setEditContent(message.content);
        setNewMessage(message.content);
    };

    const updateMessageHandler = async () => {
        try {
            const { data } = await API.put(`/message/${editingMessage._id}`, {
                content: newMessage,
            });
            setMessages((prev) =>
                prev.map((m) => (m._id === data._id ? data : m))
            );
            socket.emit("message edited", data);
            setEditingMessage(null);
            setNewMessage("");
            toast.success("Message updated");
        } catch (error) {
            toast.error("Failed to update message");
        }
    };

    const uploadFileToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await API.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.url;
        } catch (error) {
            console.error("Upload error:", error);
            throw new Error(error.response?.data?.message || "File upload failed");
        }
    };

    const getFileType = (file) => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.includes('pdf') || file.type.includes('document') ||
            file.type.includes('text') || file.type.includes('sheet')) return 'document';
        return 'other';
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const sendFileMessage = async () => {
        if (!selectedFile) return;

        setUploadingFile(true);
        try {
            const fileUrl = await uploadFileToCloudinary(selectedFile);
            const fileType = getFileType(selectedFile);

            const { data } = await API.post("/message", {
                content: newMessage || `Sent a ${fileType}`,
                chatId: selectedChat._id,
                attachmentType: fileType,
                attachmentUrl: fileUrl,
                attachmentName: selectedFile.name,
                attachmentSize: selectedFile.size,
            });

            setNewMessage("");
            setSelectedFile(null);
            setFilePreview(null);
            socket.emit("new message", data);
            setMessages([...messages, data]);
            toast.success("File sent successfully");
        } catch (error) {
            console.error("File upload error:", error);
            toast.error("Failed to send file");
        } finally {
            setUploadingFile(false);
        }
    };

    const sendMessage = async (event, messageContent = null) => {
        if (event?.key === "Enter" || event?.type === "click" || messageContent) {
            // If there's a file selected, send file message
            if (selectedFile) {
                await sendFileMessage();
                return;
            }

            const content = messageContent || newMessage;
            if (content) {
                socket.emit("stop typing", selectedChat._id);
                try {
                    const { data } = await API.post("/message", {
                        content: content,
                        chatId: selectedChat._id,
                    });
                    setNewMessage("");
                    socket.emit("new message", data);
                    setMessages([...messages, data]);
                    setShowEmojiPicker(false);
                    setShowGifPicker(false);
                } catch (error) {
                    toast.error("Failed to send message");
                }
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    const onGifClick = (gif, e) => {
        e.preventDefault();
        const gifUrl = gif.images.fixed_height.url;
        sendMessage(null, `[GIF]${gifUrl}`);
    };

    const fetchGifs = (offset) => {
        if (gifSearchTerm) {
            return gf.search(gifSearchTerm, { offset, limit: 10 });
        }
        return gf.trending({ offset, limit: 10 });
    };

    const getSender = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
    };

    const cancelFileSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            className={`${selectedChat ? "flex" : "hidden"
                } md:flex flex-col flex-1 h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative`}
        >
            {selectedChat ? (
                <>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedChat(null)}
                                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {!selectedChat.isGroupChat ? getSender(user, selectedChat.users) : selectedChat.chatName}
                                </h3>
                                <p className="text-xs text-blue-500 font-medium">
                                    {isTyping ? "Typing..." : "Online"}
                                </p>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <Info size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col min-h-0">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={48} />
                            </div>
                        ) : (
                            <ScrollableChat
                                messages={messages}
                                onDelete={deleteMessageHandler}
                                onEdit={editMessageHandler}
                            />
                        )}
                    </div>

                    {/* File Preview */}
                    {selectedFile && (
                        <div className="px-6 py-3 bg-white dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800 transition-colors">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                                {filePreview ? (
                                    <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                                ) : (
                                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                        <File size={32} className="text-slate-500 shadow-sm" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={cancelFileSelection}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-24 left-6 z-50">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={isDarkMode ? "dark" : "light"}
                                width={320}
                                height={400}
                            />
                        </div>
                    )}

                    {/* GIF Picker */}
                    {showGifPicker && (
                        <div ref={gifPickerRef} className="absolute bottom-24 right-6 z-50 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 w-85 max-h-96 overflow-hidden transition-all">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">Search GIPHY</h3>
                                <button
                                    onClick={() => setShowGifPicker(false)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search GIFs..."
                                value={gifSearchTerm}
                                onChange={(e) => setGifSearchTerm(e.target.value)}
                                className="w-full mb-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                            />
                            <div className="overflow-y-auto max-h-64 no-scrollbar">
                                <Grid
                                    width={300}
                                    columns={2}
                                    fetchGifs={fetchGifs}
                                    onGifClick={onGifClick}
                                    key={gifSearchTerm}
                                />
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-6 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors">
                        <div className="relative flex items-center gap-2">
                            {/* Emoji Button */}
                            <button
                                onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker);
                                    setShowGifPicker(false);
                                }}
                                className={`p-2.5 rounded-xl transition-all ${showEmojiPicker ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Smile size={22} />
                            </button>

                            {/* GIF Button */}
                            <button
                                onClick={() => {
                                    setShowGifPicker(!showGifPicker);
                                    setShowEmojiPicker(false);
                                }}
                                className={`p-2 rounded-lg transition-colors ${showGifPicker ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <ImageIcon size={20} />
                            </button>

                            {/* File Attachment Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingFile}
                                className={`p-2 rounded-lg transition-colors ${selectedFile ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'} disabled:opacity-50`}
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                            />

                            {/* Message Input */}
                            <input
                                className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 px-6 outline-none focus:border-primary/50 transition-all text-sm text-slate-800 dark:text-white"
                                placeholder={selectedFile ? "Add a caption (optional)..." : editingMessage ? "Edit message..." : "Type a message..."}
                                onChange={typingHandler}
                                value={newMessage}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        editingMessage ? updateMessageHandler() : sendMessage(e);
                                    }
                                }}
                            />

                            {/* Cancel Edit Button */}
                            {editingMessage && (
                                <button
                                    onClick={() => {
                                        setEditingMessage(null);
                                        setNewMessage("");
                                    }}
                                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}

                            {/* Send Button */}
                            <button
                                onClick={editingMessage ? updateMessageHandler : sendMessage}
                                disabled={(!newMessage && !selectedFile) || uploadingFile}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {uploadingFile ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : editingMessage ? (
                                    <Check size={18} />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex h-full items-center justify-center text-slate-500 flex-col gap-4">
                    <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-colors">
                        <MessageSquare size={40} className="opacity-20" />
                    </div>
                    <p className="text-xl font-medium">Select a chat to start messaging</p>
                </div>
            )}
        </div>
    );
};

export default ChatBox;
