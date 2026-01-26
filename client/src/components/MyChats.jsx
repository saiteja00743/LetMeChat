import { useEffect, useState } from "react";
import { useChat } from "../context/ChatProvider";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Plus, MessageSquare } from "lucide-react";

const MyChats = ({ fetchAgain }) => {
    const { selectedChat, setSelectedChat, chats, setChats } = useChat();
    const { user } = useAuth();

    const fetchChats = async () => {
        try {
            const { data } = await API.get("/chat");
            setChats(data);
        } catch (error) {
            toast.error("Failed to load chats");
        }
    };

    useEffect(() => {
        fetchChats();
    }, [fetchAgain]);

    const getSender = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
    };

    const getSenderAvatar = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].avatar : users[0].avatar;
    };

    return (
        <div
            className={`${selectedChat ? "hidden" : "flex"
                } md:flex flex-col w-full md:w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-colors duration-300`}
        >
            <div className="flex items-center justify-between p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Chats</h2>
                <button className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <Plus size={18} />
                    New Group
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {chats.length > 0 ? (
                    chats.map((chat) => (
                        <button
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`flex w-full items-center gap-4 rounded-xl p-4 transition-all ${selectedChat?._id === chat._id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                                }`}
                        >
                            <img
                                src={
                                    (!chat.isGroupChat
                                        ? getSenderAvatar(user, chat.users)
                                        : "https://icon-library.com/images/group-icon-png/group-icon-png-10.jpg") || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                                }
                                className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                                alt="avatar"
                            />
                            <div className="flex-1 text-left">
                                <p className="font-semibold line-clamp-1">
                                    {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                                </p>
                                {chat.latestMessage && (
                                    <p className={`text-xs line-clamp-1 ${selectedChat?._id === chat._id ? "text-blue-100" : "text-slate-500 dark:text-slate-500"}`}>
                                        <span className="font-medium">{chat.latestMessage.sender.name}:</span>{" "}
                                        {chat.latestMessage.content}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>No chats found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyChats;
