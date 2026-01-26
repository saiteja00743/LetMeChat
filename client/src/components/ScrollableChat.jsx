import React, { useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Edit2, Trash2, File, Download } from "lucide-react";
import { useState } from "react";

const FileIcon = ({ m }) => {
    const ext = m.attachmentName?.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <File className="text-red-400" />;
    if (['doc', 'docx'].includes(ext)) return <File className="text-blue-400" />;
    return <File className="text-slate-400" />;
};

const ScrollableChat = ({ messages, onDelete, onEdit }) => {
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const isSameSender = (messages, m, i, userId) => {
        return (
            i < messages.length - 1 &&
            (messages[i + 1].sender._id !== m.sender._id ||
                messages[i + 1].sender._id === undefined) &&
            messages[i].sender._id !== userId
        );
    };

    const isLastMessage = (messages, i, userId) => {
        return (
            i === messages.length - 1 &&
            messages[messages.length - 1].sender._id !== userId &&
            messages[messages.length - 1].sender._id
        );
    };

    return (
        <div className="flex flex-col gap-2">
            {messages &&
                messages.map((m, i) => (
                    <div
                        className={`flex items-end gap-3 px-2 ${m.sender._id === user._id ? "justify-end" : "justify-start"
                            }`}
                        key={m._id}
                    >
                        {(isSameSender(messages, m, i, user._id) ||
                            isLastMessage(messages, i, user._id)) ? (
                            <img
                                src={m.sender.avatar || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                                alt={m.sender.name}
                                className="h-8 w-8 rounded-full cursor-pointer hover:scale-105 transition-transform object-cover shadow-sm bg-slate-300"
                                title={m.sender.name}
                            />
                        ) : (
                            <div className="w-8"></div>
                        )}
                        <div className={`group relative flex items-center max-w-[80%] md:max-w-[70%]`}>
                            {m.sender._id === user._id && (
                                <div className="absolute -left-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(m)}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-500 transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(m._id)}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                            <motion.span
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`relative px-5 py-2.5 text-[15px] shadow-sm break-words leading-relaxed ${m.sender._id === user._id
                                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm border border-slate-200/50 dark:border-slate-600/50"
                                    }`}
                                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                                {/* Render file attachments */}
                                {m.attachmentUrl ? (
                                    <div className="space-y-2.5">
                                        {/* Image attachment */}
                                        {m.attachmentType === 'image' && (
                                            <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                                                <img
                                                    src={m.attachmentUrl}
                                                    alt={m.attachmentName}
                                                    className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    onClick={() => window.open(m.attachmentUrl, '_blank')}
                                                />
                                            </div>
                                        )}

                                        {/* Video attachment */}
                                        {m.attachmentType === 'video' && (
                                            <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/20">
                                                <video
                                                    src={m.attachmentUrl}
                                                    controls
                                                    className="w-full h-auto max-h-[300px]"
                                                />
                                            </div>
                                        )}

                                        {/* Audio attachment */}
                                        {m.attachmentType === 'audio' && (
                                            <audio src={m.attachmentUrl} controls className="w-full min-w-[240px]" />
                                        )}

                                        {/* Document/Other attachment */}
                                        {(m.attachmentType === 'document' || m.attachmentType === 'other') && (
                                            <a
                                                href={m.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={m.attachmentName}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group ${m.sender._id === user._id
                                                    ? "bg-white/10 border-white/20 hover:bg-white/20"
                                                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-lg transition-colors ${m.sender._id === user._id ? "bg-white/20" : "bg-blue-500/10 dark:bg-blue-500/20"}`}>
                                                    <FileIcon m={m} />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className={`text-sm font-semibold truncate ${m.sender._id === user._id ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>{m.attachmentName}</p>
                                                    <p className={`text-xs ${m.sender._id === user._id ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                                                        {m.attachmentSize ? `${(m.attachmentSize / 1024).toFixed(1)} KB` : 'Document'}
                                                    </p>
                                                </div>
                                                <Download size={20} className={`${m.sender._id === user._id ? "text-blue-100" : "text-slate-400 dark:text-slate-500"} transition-colors`} />
                                            </a>
                                        )}

                                        {/* Caption/Content */}
                                        {m.content && !m.content.startsWith('[GIF]') && (
                                            <p className="mt-1">{m.content}</p>
                                        )}
                                    </div>
                                ) : (
                                    /* Regular text or GIF message */
                                    <>
                                        {m.content.startsWith('[GIF]') ? (
                                            <div className="overflow-hidden rounded-xl">
                                                <img
                                                    src={m.content.replace('[GIF]', '')}
                                                    alt="GIF"
                                                    className="w-full h-auto max-h-[250px] object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            m.content
                                        )}
                                    </>
                                )}
                                <div className={`flex items-center justify-end gap-1.5 mt-1.5 select-none ${m.sender._id === user._id ? "text-blue-100/90" : "text-slate-400 dark:text-slate-400"}`}>
                                    {m.isEdited && <span className="text-[10px] italic">edited</span>}
                                    <span className="text-[10px] font-medium opacity-80">
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {m.sender._id === user._id && (
                                        // Simple checkmark simulation since typical "read receipts" logic isn't fully in m object yet, keeping clean
                                        <span className="text-[10px]"></span>
                                    )}
                                </div>
                            </motion.span>
                        </div>
                    </div>
                ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ScrollableChat;
