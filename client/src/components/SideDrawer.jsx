import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatProvider";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Search, Bell, LogOut, Loader2, User as UserIcon, Settings, Camera, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [newName, setNewName] = useState("");
    const [newAvatar, setNewAvatar] = useState("");

    const { user, setUser, logout } = useAuth();
    const { setSelectedChat, chats, setChats } = useChat();

    const handleSearch = async () => {
        if (!search) {
            toast.error("Please enter something to search");
            return;
        }
        setLoading(true);
        try {
            const { data } = await API.get(`/user?search=${search}`);
            setSearchResults(data);
        } catch (error) {
            toast.error("Failed to load search results");
        } finally {
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoading(true);
            const { data } = await API.post("/chat", { userId });
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setShowSearch(false);
        } catch (error) {
            toast.error("Error fetching the chat");
        } finally {
            setLoading(false);
        }
    };

    const postDetails = async (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast.error("Please select an image");
            setLoading(false);
            return;
        }

        if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/webp") {
            const data = new FormData();
            data.append("file", pics);

            try {
                // Use our backend upload route
                const response = await API.post("/upload", data, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                setNewAvatar(response.data.url);
                setLoading(false);
                toast.success("Image uploaded successfully");
            } catch (error) {
                console.error("Upload Error:", error);
                setLoading(false);
                toast.error(error.response?.data?.message || "Upload failed");
            }
        } else {
            toast.error("Please select a JPEG, PNG or WebP image");
            setLoading(false);
            return;
        }
    };

    const updateProfileHandler = async () => {
        try {
            setLoading(true);
            const { data } = await API.put("/user/profile", {
                name: newName || user.name,
                avatar: newAvatar || user.avatar,
            });
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            toast.success("Profile updated successfully");
            setShowProfile(false);
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowSearch(true)}
                    className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-white transition-all"
                >
                    <Search size={18} />
                    <span className="hidden md:block font-medium">Search Users</span>
                </button>
            </div>

            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Letme
            </h1>

            <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />

                <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-lg transition-all"
                    onClick={() => {
                        setNewName(user.name);
                        setNewAvatar(user.avatar || "");
                        setShowProfile(true);
                    }}
                >
                    <div className="hidden text-right md:block">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Online</p>
                    </div>
                    <img
                        src={user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                        alt={user?.name}
                        className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover"
                    />
                </div>
                <button
                    onClick={logout}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                    <LogOut size={20} />
                </button>
            </div>

            <AnimatePresence>
                {showProfile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfile(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
                                <button onClick={() => setShowProfile(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <CloseIcon size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <img
                                        src={newAvatar || user?.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                                        className="h-28 w-28 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover shadow-lg"
                                        alt="Avatar Preview"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block font-medium">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block font-medium">Profile Picture</label>
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            p={1.5}
                                            accept="image/*"
                                            onChange={(e) => postDetails(e.target.files[0])}
                                            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-slate-500 dark:text-slate-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 transition-all border border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={updateProfileHandler}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary py-4 font-bold text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}

                {showSearch && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSearch(false)}
                            className="fixed inset-0 z-40 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            className="fixed left-0 top-0 z-50 h-full w-full max-w-sm bg-white dark:bg-slate-900 p-6 shadow-2xl border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search Users</h2>
                                <button
                                    onClick={() => setShowSearch(false)}
                                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="mb-6 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name or email"
                                    className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="rounded-lg bg-primary px-4 py-2 font-medium hover:bg-blue-600 text-white shadow-lg shadow-primary/20"
                                >
                                    Go
                                </button>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                    </div>
                                ) : (
                                    searchResults.map((user) => (
                                        <button
                                            key={user._id}
                                            onClick={() => accessChat(user._id)}
                                            className="flex w-full items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800/50"
                                        >
                                            <img
                                                src={user.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                                                alt={user.name}
                                                className="h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700"
                                            />
                                            <div className="text-left">
                                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SideDrawer;
