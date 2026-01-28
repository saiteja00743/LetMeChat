import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import SideDrawer from "../components/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
    const [fetchAgain, setFetchAgain] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex h-screen w-full max-w-full flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
            {user && <SideDrawer />}
            <div className="flex flex-1 overflow-hidden relative max-w-full">
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && (
                    <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                )}
            </div>
        </div>
    );
};

export default ChatPage;
