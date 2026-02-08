import { useEffect, useMemo, useState } from "react";
import {
  createChatApi,
  getChatContactsApi,
  getChatMessagesApi,
  getChatsApi,
  markChatReadApi,
  sendChatMessageApi
} from "../api/api";
import { useTheme } from "../components/themeContext.jsx";
import { useNotification } from "../components/notificationContext.jsx";
import { useDashboard } from "../components/dashboardContext.jsx";

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

  const selectedChatId = selectedChat?.id;

  const selectedParticipant = useMemo(() => {
    return selectedChat?.participant || null;
  }, [selectedChat]);

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <div
        className={`rounded-xl border p-4 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-blue-200 bg-white"
        }`}
      >
        <h2 className="text-lg font-semibold text-blue-500">Direct Messages</h2>
        <p className="text-sm text-gray-400">
          Start a private conversation with a teammate.
        </p>

        <div className="mt-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Conversations
          </h3>
          {loadingChats ? (
            <p className="text-sm text-gray-500">Loading chats...</p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-gray-500">No chats yet.</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left transition ${
                  selectedChatId === chat.id
                    ? darkMode
                      ? "border-blue-400 bg-gray-700"
                      : "border-blue-400 bg-blue-50"
                    : darkMode
                      ? "border-gray-700 hover:border-blue-400 hover:bg-gray-700"
                      : "border-blue-100 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {chat.participant?.name || "Unknown"}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {chat.lastMessage?.text || "No messages yet"}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Start a new chat
          </h3>
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500">No contacts available.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleStartChat(contact.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                    darkMode
                      ? "border-gray-700 hover:border-blue-400 hover:bg-gray-700"
                      : "border-blue-100 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </div>
                  <span className="text-xs text-blue-500">Message</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-blue-200 bg-white"
        }`}
      >
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-blue-500">
            {selectedParticipant?.name || "Select a conversation"}
          </h2>
          {selectedParticipant?.email && (
            <p className="text-sm text-gray-500">
              {selectedParticipant.email}
            </p>
          )}
        </div>

        <div className="mt-4 h-[420px] space-y-4 overflow-y-auto pr-2">
          {!selectedChatId ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Choose a chat to see your messages.
            </div>
          ) : loadingMessages ? (
            <p className="text-sm text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((message) => {
              const isSender = message.senderId === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                      isSender
                        ? "bg-blue-500 text-white"
                        : darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-blue-50 text-gray-800"
                    }`}
                  >
                    <p>{message.body}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            placeholder={
              selectedChatId ? "Write a message..." : "Select a chat first"
            }
            disabled={!selectedChatId}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none ${
              darkMode
                ? "border-gray-700 bg-gray-900 text-gray-100 focus:border-blue-400"
                : "border-blue-200 bg-white text-gray-800 focus:border-blue-400"
            }`}
          />
          <button
            type="submit"
            disabled={!selectedChatId || !messageBody.trim()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              !selectedChatId || !messageBody.trim()
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
