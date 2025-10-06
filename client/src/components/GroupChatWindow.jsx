
import { useState, useRef, useMemo, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { Smile, UserPlus, Paperclip, Send, Users, Settings, X, Crown } from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import { useSelector } from "react-redux";
import { EmojiModal } from "./modal/EmojiModal";
import { GroupManagementModal } from "./modal/GroupManagementModal";
import { BACKEND_BASE_URL } from "../utils/constant";
import GroupMembersList from "./modal/GroupMembersList";
const GroupChatWindow = ({ selectedGroupId, groups, onGroupUpdated }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [groupMembers, setGroupMembers] = useState(null)
  const [mentionUsers, setMentionUsers] = useState([])
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [groupId, setGroupId] = useState(selectedGroupId);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingGroupDetails, setLoadingGroupDetails] = useState(false);
  const endRef = useRef(null);
  const userInfo = useSelector((state) => state.user);
  const senderId = userInfo?._id;
  const { socket, isConnected, joinGroupChat } = useSocket();
   
  
  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== groupId) {
      setGroupId(selectedGroupId);
      setMessages([]); 
      setGroupDetails(null); 
    }
  }, [selectedGroupId, groupId]);

  // Fetch fresh group details when groupId changes
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      setLoadingGroupDetails(true);
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/groups/${groupId}`, {
          method: "GET",
          credentials: "include",
        });
        
        const data = await response.json();
        if (data.success) {
          setGroupDetails(data.data);
          console.log("Group details fetched:", data.data);
          setGroupMembers(data.data.members)
        } else {
          console.error("Failed to fetch group details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
      } finally {
        setLoadingGroupDetails(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // Use fresh group details if available, otherwise fall back to groups prop
  const currentGroup = useMemo(() => {
    return groupDetails || groups?.find((g) => g._id === groupId);
  }, [groupId, groups, groupDetails]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !senderId) return;

 
    const handleGroupMessageReceived = ({
      senderId: msgSenderId,
      message: recMsg,
      timestamp,
      senderName,
      senderAvatar,
      isPrivateMention,
      mentions,
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          from: msgSenderId === senderId ? "me" : "other",
          text: recMsg,
          senderName: msgSenderId === senderId ? "You" : senderName,
          time: new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isPrivateMention: isPrivateMention || false,
        },
      ]);
    };

    // Listen for group conversation history
    const handleGroupConversationHistory = (history) => {
      if (Array.isArray(history)) {
        const formattedMessages = history.map((msg) => ({
          id: msg._id || `m_${Date.now()}_${Math.random()}`,
          from: msg.senderId === senderId ? "me" : "other",
          text: msg.message,
          senderName: msg.senderId === senderId ? "You" : msg.senderName,
          time: new Date(msg.createdAt || msg.timestamp).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          isPrivateMention: msg.isPrivateMention || false,
        }));
        setMessages(formattedMessages);
      }
    };

    // Listen for user joined group event
    const handleUserJoinedGroup = ({ userId, username }) => {
      // console.log(`${username} joined the group`);
      // You can add a system message here if you want
    };

    socket.on("groupMessageReceived", handleGroupMessageReceived);
    socket.on("groupConversationHistory", handleGroupConversationHistory);
    socket.on("userJoinedGroup", handleUserJoinedGroup);

    return () => {
      socket.off("groupMessageReceived", handleGroupMessageReceived);
      socket.off("groupConversationHistory", handleGroupConversationHistory);
      socket.off("userJoinedGroup", handleUserJoinedGroup);
    };
  }, [socket, senderId]);

  // Handle groupId changes and socket room management
  useEffect(() => {
    if (!groupId || !senderId || !socket || !isConnected) return;

    // Join the group room
    joinGroupChat(senderId, groupId, userInfo.username);

    setMessages([]);

    // Request conversation history for this group
    socket.emit("getGroupConversation", {
      groupId,
    });
  }, [
    groupId,
    senderId,
    socket,
    isConnected,
    userInfo?.username,
    joinGroupChat,
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;
    const messageText = newMessage.trim();
    socket.emit("sendGroupMessage", {
      senderId,
      groupId,
      message: messageText,
      mentionUsers
    });

    setNewMessage("");
    setMentionUsers([])
  };

  const removeMentionUser = (userId) => {
    setMentionUsers(prev => prev.filter(user => user._id !== userId));
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => {
      const newMsg = prev + emoji;
      return newMsg;
    });
    setShowEmojiPicker(false);
  };

  const handleGroupUpdated = () => {
    // Refetch group details when group is updated
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/groups/${groupId}`, {
          method: "GET",
          credentials: "include",
        });
        
        const data = await response.json();
        if (data.success) {
          setGroupDetails(data.data);
        }
      } catch (error) {
        console.error("Error refetching group details:", error);
      }
    };

    fetchGroupDetails();
    onGroupUpdated?.();
    setShowGroupManagement(false);
  };

  const handleShowMembersList = () => {
    setShowMembersList(true);
  };

  return (
    <>
      <section className="min-h-[calc(100dvh-56px)] lg:min-h-dvh bg-white dark:bg-gray-950">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentGroup?.avatarUrl || "/group-avatar.png"}
                alt={`${currentGroup?.name || "Group"} avatar`}
                className="h-9 w-9 rounded-full"
              />
              <Users
                size={14}
                className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-950 rounded-full p-0.5"
              />
            </div>
            <div>
              <p className="font-semibold leading-tight">
                {currentGroup?.name || (loadingGroupDetails ? "Loading..." : "Group")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {!isConnected ? (
                  <span className="text-amber-500 dark:text-amber-400">
                    Reconnecting...
                  </span>
                ) : loadingGroupDetails ? (
                  <span className="text-gray-400">Loading members...</span>
                ) : (
                  `${currentGroup?.members?.length || 0} members`
                )}
              </p>
            </div>
          </div>

          {/* Group Management Button */}
          <button
            onClick={() => setShowGroupManagement(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Group Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[calc(100dvh-56px-64px-16px)] lg:h-[calc(100dvh-64px-80px-16px)] overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages?.map((m) => (
            <div key={m.id}>
              {m.from === "other" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {m.senderName}
                </p>
              )}
              <MessageBubble
                from={m.from}
                text={m.text}
                time={m.time}
                isPrivateMention={m.isPrivateMention}
              />
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="px-4 pb-4 pt-2 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
        >
           {/* Mention Users Display */}
           {mentionUsers.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {mentionUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-sm"
                >
                  <span>@{user.username}</span>
                  <button
                    type="button"
                    onClick={() => removeMentionUser(user._id)}
                    className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2">
          <button
              type="button"
              className={`p-2 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ${
                mentionUsers.length > 0 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Show Members"
              onClick={handleShowMembersList}
            >
              <UserPlus size={20}/>
            </button>
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              title="Emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              title="Attach"
            >
              <Paperclip size={20} />
            </button>
            <textarea
              rows={1}
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              placeholder={mentionUsers.length > 0 ? "Type a message to mention selected users..." : "Type a message"}
              className="min-h-[40px] max-h-32 flex-1 resize-none bg-transparent outline-none px-1 py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-white shadow hover:opacity-95 transition disabled:opacity-50"
              title="Send"
              disabled={!isConnected}
            >
              <Send size={18} />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </form>
        {showEmojiPicker && (
          <EmojiModal
            onEmojiSelect={addEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </section>

   
      {/* Group Members List Modal */}
      {showMembersList && currentGroup && (
        <GroupMembersList 
          groupMembers={groupMembers}
          currentGroup={currentGroup}
          senderId={senderId}
          selectedMentionUsers={mentionUsers}
          onSelect={(member) => {
            setMentionUsers((prev) => {
              if (prev.find((u) => u._id === member._id)) return prev;
              return [...prev, member];
            });
          }}
          onClose={() => setShowMembersList(false)}
        />
      )}

      {/* Group Management Modal */}
      {showGroupManagement && currentGroup && (
        <GroupManagementModal
          group={currentGroup}
          currentUser={userInfo}
          onClose={() => setShowGroupManagement(false)}
          onGroupUpdated={handleGroupUpdated}
        />
      )}
    </>
  );
};

export default GroupChatWindow;
