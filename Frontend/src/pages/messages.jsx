import { useEffect, useMemo, useState } from "react";
import {
  createChatApi,
  getChatContactsApi,
  getChatMessagesApi,
  getChatsApi,
  markChatReadApi,
  sendChatMessageApi
} from "../api/api";
import { Search, SendHorizonal, MessageCircleMore, Sparkles } from "lucide-react";
import { useTheme } from "../components/themeContext.jsx";
import { useNotification } from "../components/notificationContext.jsx";
import { useDashboard } from "../components/dashboardContext.jsx";

const formatTimestamp = (value) => new Date(value).toLocaleString();

const Messages = () => {
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();
  const { data } = useDashboard();
  const userId = data?.id;

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedChatId = selectedChat?.id;

  const selectedParticipant = useMemo(() => selectedChat?.participant || null, [selectedChat]);

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    const query = searchTerm.toLowerCase();
    return chats.filter((chat) => {
      const haystack = `${chat.participant?.name || ""} ${chat.participant?.email || ""} ${chat.lastMessage?.text || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [chats, searchTerm]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const query = searchTerm.toLowerCase();
    return contacts.filter((contact) => `${contact.name} ${contact.email}`.toLowerCase().includes(query));
  }, [contacts, searchTerm]);

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const [chatData, contactData] = await Promise.all([
        getChatsApi(),
        getChatContactsApi()
      ]);
      setChats(chatData);
      setContacts(contactData);
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to load chats",
        "error"
      );
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      setLoadingMessages(true);
      const data = await getChatMessagesApi(chatId);
      setMessages(data);
      await markChatReadApi(chatId);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to load messages",
        "error"
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleStartChat = async (contactId) => {
    try {
      const chat = await createChatApi(contactId);
      setChats((prev) => {
        const existing = prev.find((item) => item.id === chat.id);
        if (existing) {
          return prev.map((item) => (item.id === chat.id ? chat : item));
        }
        return [chat, ...prev];
      });
      setSelectedChat(chat);
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to start chat",
        "error"
      );
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageBody.trim() || !selectedChatId) return;

    try {
      const message = await sendChatMessageApi(
        selectedChatId,
        messageBody.trim()
      );
      setMessages((prev) => [...prev, message]);
      setMessageBody("");
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                lastMessage: {
                  text: message.body,
                  sender: message.senderId,
                  createdAt: message.createdAt
                }
              }
            : chat
        )
      );
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Failed to send message",
        "error"
      );
    }
  };

  return (
    <div className="grid min-h-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <aside
        className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"
        }`}
      >
        <div className={`border-b p-5 ${darkMode ? "border-gray-700" : "border-blue-100"}`}>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Inbox</p>
              <h2 className="mt-2 break-words text-2xl font-semibold">Direct Messages</h2>
            </div>
            <div className={`shrink-0 rounded-2xl p-3 ${darkMode ? "bg-gray-900 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
              <MessageCircleMore size={20} />
            </div>
          </div>

          <div className={`mt-4 flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 ${darkMode ? "border-gray-700 bg-gray-900" : "border-blue-100 bg-blue-50/70"}`}>
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search chats or teammates"
              className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${darkMode ? "text-gray-100 placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"}`}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <section className="min-w-0">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Conversations</h3>
              <span className="shrink-0 text-xs text-gray-400">{filteredChats.length}</span>
            </div>
            {loadingChats ? (
              <p className="text-sm text-gray-500">Loading chats...</p>
            ) : filteredChats.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-4 text-sm ${darkMode ? "border-gray-700 text-gray-400" : "border-blue-100 text-gray-500"}`}>
                No conversations found.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full min-w-0 rounded-2xl border px-4 py-3 text-left transition ${
                      selectedChatId === chat.id
                        ? darkMode
                          ? "border-blue-400 bg-blue-500/10"
                          : "border-blue-300 bg-blue-50"
                        : darkMode
                          ? "border-gray-700 bg-gray-900 hover:border-blue-400"
                          : "border-blue-100 hover:border-blue-200 hover:bg-blue-50/70"
                    }`}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium">{chat.participant?.name || "Unknown teammate"}</p>
                        <p className="mt-1 break-all text-xs text-gray-500">{chat.participant?.email}</p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 break-words text-xs text-gray-500">{chat.lastMessage?.text || "No messages yet"}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Start a chat</h3>
              <Sparkles size={14} className="shrink-0 text-blue-500" />
            </div>
            {filteredContacts.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-4 text-sm ${darkMode ? "border-gray-700 text-gray-400" : "border-blue-100 text-gray-500"}`}>
                No teammates available.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleStartChat(contact.id)}
                    className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      darkMode
                        ? "border-gray-700 bg-gray-900 hover:border-blue-400"
                        : "border-blue-100 hover:border-blue-200 hover:bg-blue-50/70"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">{contact.name}</p>
                      <p className="break-all text-xs text-gray-500">{contact.email}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-blue-500">Message</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      <section
        className={`flex min-h-[calc(100vh-12rem)] min-w-0 flex-col overflow-hidden rounded-3xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"
        }`}
      >
        <div className={`min-w-0 border-b px-6 py-5 ${darkMode ? "border-gray-700" : "border-blue-100"}`}>
          <h2 className="break-words text-xl font-semibold">
            {selectedParticipant?.name || "Select a conversation"}
          </h2>
          {selectedParticipant?.email ? (
            <p className="mt-1 break-all text-sm text-gray-500">{selectedParticipant.email}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Pick a teammate from the left to start collaborating.</p>
          )}
        </div>

        <div className={`flex min-h-0 flex-1 flex-col ${darkMode ? "bg-gray-850" : "bg-slate-50/50"}`}>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6">
            {!selectedChatId ? (
              <div className="flex min-h-[320px] flex-1 items-center justify-center">
                <div className={`max-w-md rounded-3xl border p-8 text-center ${darkMode ? "border-gray-700 bg-gray-900" : "border-blue-100 bg-white"}`}>
                  <MessageCircleMore size={28} className="mx-auto text-blue-500" />
                  <h3 className="mt-4 break-words text-lg font-semibold">Your team conversations live here</h3>
                  <p className="mt-2 break-words text-sm text-gray-500">Open an existing chat or start a new one to keep work moving like a mini Jira workspace.</p>
                </div>
              </div>
            ) : loadingMessages ? (
              <p className="text-sm text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <div className="flex min-h-[320px] flex-1 items-center justify-center text-sm text-gray-500">
                No messages yet. Kick things off with the first update.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isSender = message.senderId === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex min-w-0 ${isSender ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-full rounded-3xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                          isSender
                            ? "bg-blue-500 text-white"
                            : darkMode
                              ? "bg-gray-900 text-gray-100"
                              : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="break-words whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                        <p className={`mt-2 break-words text-[11px] ${isSender ? "text-blue-100" : "text-gray-400"}`}>
                          {formatTimestamp(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className={`border-t px-4 py-5 sm:px-6 ${darkMode ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"}`}>
            <div className={`flex min-w-0 items-end gap-3 rounded-3xl border p-3 ${darkMode ? "border-gray-700 bg-gray-900" : "border-blue-100 bg-slate-50"}`}>
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder={selectedChatId ? "Share an update, blocker, or next step..." : "Select a chat first"}
                disabled={!selectedChatId}
                rows={1}
                className={`max-h-36 min-h-[52px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none ${darkMode ? "text-gray-100 placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"}`}
              />
              <button
                type="submit"
                disabled={!selectedChatId || !messageBody.trim()}
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition ${
                  !selectedChatId || !messageBody.trim()
                    ? "bg-gray-400"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <SendHorizonal size={18} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Messages;
