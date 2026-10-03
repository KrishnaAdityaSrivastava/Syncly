import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChatApi,
  getChatContactsApi,
  getChatMessagesApi,
  getChatsApi,
  markChatReadApi,
  sendChatMessageApi,
  updateChatRequestApi
} from "../api/api";
import { Search, SendHorizonal, MessageCircleMore, Sparkles, Check, X, User, MessageSquare } from "lucide-react";
import { useTheme } from "../context/themeContext.jsx";
import { useNotification } from "../context/notificationContext.jsx";
import { useDashboard } from "../context/dashboardContext.jsx";
import { socket } from "../socket.js";
import { motion, AnimatePresence } from "framer-motion";

const formatTimestamp = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Messages = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const { data } = useDashboard();
  const userId = data?.id;
  const messagesEndRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedChatId = selectedChat?.id;

  const getUserDisplayName = (user) => {
    const name = user?.name?.trim();
    const email = user?.email?.trim();
    return name || email || "Unknown teammate";
  };

  const selectedParticipant = useMemo(() => selectedChat?.participant || null, [selectedChat]);
  const pendingContactIds = useMemo(() => new Set([...incomingRequests, ...outgoingRequests].map((request) => request.participant?.id)), [incomingRequests, outgoingRequests]);

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    const query = searchTerm.toLowerCase();
    return chats.filter((chat) => `${getUserDisplayName(chat.participant)} ${chat.participant?.email || ""} ${chat.lastMessage?.text || ""}`.toLowerCase().includes(query));
  }, [chats, searchTerm]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const query = searchTerm.toLowerCase();
    return contacts.filter((contact) => `${getUserDisplayName(contact)} ${contact.email}`.toLowerCase().includes(query));
  }, [contacts, searchTerm]);

  const loadChats = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoadingChats(true);
      const [chatState, contactData] = await Promise.all([getChatsApi(), getChatContactsApi()]);
      setChats(chatState?.chats || []);
      setIncomingRequests(chatState?.incomingRequests || []);
      setOutgoingRequests(chatState?.outgoingRequests || []);
      setContacts(contactData);
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return (chatState?.chats || []).find((chat) => chat.id === prev.id) || null;
      });
    } catch (error) {
      if (!silent) {
        showNotification(error?.response?.data?.message || "Failed to load chats", "error");
      }
    } finally {
      if (!silent) setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId, { silent = false } = {}) => {
    try {
      if (!silent) setLoadingMessages(true);
      const data = await getChatMessagesApi(chatId);
      setMessages(data);
      await markChatReadApi(chatId);
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)));
    } catch (error) {
      if (!silent) {
        showNotification(error?.response?.data?.message || "Failed to load messages", "error");
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!userId) return undefined;

    const joinUserRoom = () => socket.emit("joinUser", userId);
    socket.on("connect", joinUserRoom);
    socket.connect();
    if (socket.connected) joinUserRoom();

    return () => {
      socket.off("connect", joinUserRoom);
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const handleChatUpdate = () => {
      loadChats({ silent: true });
      if (selectedChatId) loadMessages(selectedChatId, { silent: true });
    };

    socket.on("chat:update", handleChatUpdate);
    return () => socket.off("chat:update", handleChatUpdate);
  }, [selectedChatId]);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  useEffect(() => {
    const chatsInterval = window.setInterval(() => loadChats({ silent: true }), 10000);
    return () => window.clearInterval(chatsInterval);
  }, []);

  useEffect(() => {
    if (!selectedChatId) return undefined;
    const messagesInterval = window.setInterval(() => {
      loadMessages(selectedChatId, { silent: true });
      loadChats({ silent: true });
    }, 5000);
    return () => window.clearInterval(messagesInterval);
  }, [selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSelectChat = (chat) => setSelectedChat(chat);

  const handleStartChat = async (contactId) => {
    try {
      await createChatApi(contactId);
      showNotification("Chat request sent", "success");
      loadChats({ silent: true });
    } catch (error) {
      showNotification(error?.response?.data?.message || "Failed to send chat request", "error");
    }
  };

  const handleRequestUpdate = async (chatId, action) => {
    try {
      await updateChatRequestApi(chatId, action);
      showNotification(action === "accept" ? "Chat request accepted" : "Chat request declined", "success");
      loadChats({ silent: true });
    } catch (error) {
      showNotification(error?.response?.data?.message || `Failed to ${action} request`, "error");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageBody.trim() || !selectedChatId) return;
    try {
      const message = await sendChatMessageApi(selectedChatId, messageBody.trim());
      setMessages((prev) => [...prev, message]);
      setMessageBody("");
      loadChats({ silent: true });
    } catch (error) {
      showNotification(error?.response?.data?.message || "Failed to send message", "error");
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      {/* Left Chat Sidebar */}
      <aside className={`flex flex-col rounded-2xl border backdrop-blur-md shadow-xl overflow-hidden ${
        darkMode ? "border-slate-800 bg-slate-900/80 text-slate-100" : "border-slate-200/80 bg-white text-slate-900"
      }`}>
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500">
                Messenger
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Direct Messages</h2>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
              <MessageCircleMore size={20} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-3 py-2 text-xs">
            <Search size={16} className="text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats or teammates..."
              className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Requests Section */}
          {incomingRequests.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Requests</span>
                <span className="rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold px-1.5 py-0.5">{incomingRequests.length}</span>
              </div>
              <div className="space-y-2">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 text-xs">
                    <p className="font-bold">{getUserDisplayName(req.participant)}</p>
                    <p className="text-[11px] text-slate-400">{req.participant?.email}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button onClick={() => handleRequestUpdate(req.id, "accept")} className="flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1 font-bold text-white shadow-sm">
                        <Check size={12} /> Accept
                      </button>
                      <button onClick={() => handleRequestUpdate(req.id, "reject")} className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 font-bold text-slate-400">
                        <X size={12} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Conversations */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Conversations</span>
              <span className="text-[10px] font-bold text-slate-500">{filteredChats.length}</span>
            </div>
            {loadingChats ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading chats...</p>
            ) : filteredChats.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active chats found.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredChats.map((chat) => {
                  const active = selectedChatId === chat.id;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full text-left rounded-xl p-3 border transition-all text-xs ${
                        active 
                          ? "border-orange-500/50 bg-orange-500/10 text-orange-500 dark:text-orange-400 shadow-sm" 
                          : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-extrabold tracking-tight">{getUserDisplayName(chat.participant)}</span>
                        {chat.unreadCount > 0 && (
                          <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11px] text-slate-400 font-medium">
                        {chat.lastMessage?.text || "No messages yet"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Start Chat Contacts */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Teammates</span>
              <Sparkles size={12} className="text-orange-500" />
            </div>
            <div className="space-y-1.5">
              {filteredContacts.map((contact) => {
                const pending = pendingContactIds.has(contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => !pending && handleStartChat(contact.id)}
                    disabled={pending}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200/40 dark:border-slate-800/50 p-2.5 text-xs text-left hover:border-orange-500/30 transition-all disabled:opacity-50"
                  >
                    <span className="font-bold">{getUserDisplayName(contact)}</span>
                    <span className="text-[10px] font-bold text-orange-500">
                      {pending ? "Pending" : "Message"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>

      {/* Main Conversation Window */}
      <section className={`flex flex-col rounded-2xl border backdrop-blur-md shadow-xl overflow-hidden ${
        darkMode ? "border-slate-800 bg-slate-900/80 text-slate-100" : "border-slate-200/80 bg-white text-slate-900"
      }`}>
        {/* Chat Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-orange-500/10 text-orange-500 font-bold">
              {selectedParticipant ? getUserDisplayName(selectedParticipant)[0].toUpperCase() : <User size={18} />}
              {selectedParticipant && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {selectedParticipant ? getUserDisplayName(selectedParticipant) : "Select a conversation"}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {selectedParticipant?.email || "Click a teammate on the left to start messaging."}
              </p>
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[350px]">
          {!selectedChatId ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16">
              <MessageSquare size={36} className="text-slate-500/50 mb-3" />
              <p className="text-sm font-bold text-slate-400">Select a conversation to start chatting</p>
            </div>
          ) : loadingMessages ? (
            <p className="text-xs text-slate-400 text-center py-8">Loading message history...</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No message history yet. Say hello!</p>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === userId;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                    isMe 
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium" 
                      : darkMode ? "bg-slate-950 text-slate-100 border border-slate-800" : "bg-slate-100 text-slate-900"
                  }`}>
                    <p>{m.body}</p>
                    <p className={`mt-1.5 text-[9px] font-bold text-right ${isMe ? "text-orange-100" : "text-slate-500"}`}>
                      {formatTimestamp(m.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-2">
            <input
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder={selectedChatId ? "Write your message..." : "Select a conversation first..."}
              disabled={!selectedChatId}
              className="w-full bg-transparent px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!selectedChatId || !messageBody.trim()}
              className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/20 disabled:opacity-40"
            >
              <SendHorizonal size={16} />
            </motion.button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Messages;
