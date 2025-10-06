const { Server } = require("socket.io");
const {
  saveMessage,
  getConversationHistory,
  getGroupConversationHistory,
} = require("../models/messageModel");
const { getGroupById } = require("../models/groupModel");
const { getDB } = require("../configs/db");
const { ObjectId } = require("mongodb");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://10.10.15.171:5173", "http://localhost:5173"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ username, senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
      socket.userId = senderId;
    });

    socket.on("joinGroup", ({ username, userId, groupId }) => {
      socket.join(`group_${groupId}`);
      socket.userId = userId;

      // Notify other members
      socket.to(`group_${groupId}`).emit("userJoinedGroup", {
        userId,
        username,
      });
    });

    socket.on("leaveGroup", ({ groupId }) => {
      socket.leave(`group_${groupId}`);
    });

    socket.on("leaveRoom", () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });

    socket.on("getConversation", async ({ senderId, receiverId }) => {
      try {
        const history = await getConversationHistory(senderId, receiverId);
        socket.emit("conversationHistory", history);
      } catch (error) {
        console.error("Error fetching conversation history:", error);
        socket.emit("conversationHistory", []);
      }
    });

    socket.on("getGroupConversation", async ({ groupId }) => {
      try {
        const history = await getGroupConversationHistory(
          groupId,
          socket.userId
        );
        socket.emit("groupConversationHistory", history);
      } catch (error) {
        console.error("Error fetching group conversation history:", error);
        socket.emit("groupConversationHistory", []);
      }
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      try {
        const roomId = [senderId, receiverId].sort().join("_");

        const savedMessage = await saveMessage({
          senderId,
          receiverId,
          message,
          timestamp: new Date().toISOString(),
        });

        io.to(roomId).emit("messageReceived", {
          senderId,
          receiverId,
          message,
          timestamp: savedMessage.timestamp,
          messageId: savedMessage._id,
        });
      } catch (error) {
        console.error("Error saving or sending message:", error);

        const roomId = [senderId, receiverId].sort().join("_");
        io.to(roomId).emit("messageReceived", {
          senderId,
          receiverId,
          message,
          timestamp: new Date().toISOString(),
          error: "Failed to save message",
        });
      }
    });

    socket.on("sendGroupMessage", async ({ senderId, groupId, message, mentionUsers }) => {
      const roomId = `group_${groupId}`;
      
      try {
        const mentionedUserIds = await validateMentionedUsers(groupId, mentionUsers, senderId);
        
        // Determine visibility
        const visibleToUserIds = mentionedUserIds.length > 0 
          ? [senderId, ...mentionedUserIds] 
          : null;
        
        // Save message to database
        const savedMessage = await saveMessage({
          senderId,
          groupId,
          message,
          timestamp: new Date().toISOString(),
          mentions: mentionedUserIds,
          visibleToUserIds,
        });
        
        // Fetch sender details
        const sender = await getUserById(senderId);
        
        // Prepare message payload
        const messageData = {
          senderId,
          groupId,
          message,
          timestamp: savedMessage.timestamp,
          messageId: savedMessage._id,
          senderName: sender?.username,
          senderAvatar: sender?.avatarUrl,
          mentions: mentionedUserIds,
          isPrivateMention: mentionedUserIds.length > 0,
        };
        
        // Emit message 
        if (visibleToUserIds) {
          await emitToSpecificUsers(roomId, visibleToUserIds, messageData);
        } else {
          io.to(roomId).emit("groupMessageReceived", messageData);
        }
        
      } catch (error) {
        console.error("Error processing group message:", error);
        
        // Send error notification
        io.to(roomId).emit("groupMessageError", {
          senderId,
          groupId,
          message,
          timestamp: new Date().toISOString(),
          error: "Failed to save message",
        });
      }
    });
    
    // Helper: Validate mentioned users are actually in the group
    async function validateMentionedUsers(groupId, mentionUsers, senderId) {
      if (!mentionUsers?.length) return [];
      
      const group = await getGroupById(groupId);
      if (!group) return [];
      
      // Create a Set of valid group member IDs for O(1) lookup
      const groupMemberIds = new Set(
        group.members.map(member => member._id.toString())
      );
      
      // Filter mentioned users to only those who are group members
      const validMentionedUserIds = mentionUsers
        .map(user => user._id)
        .filter(userId => groupMemberIds.has(userId));
      
      return validMentionedUserIds;
    }
    
    // Helper: Get user details by ID
    async function getUserById(userId) {
      const db = getDB();
      return db.collection("users").findOne({ _id: new ObjectId(userId) });
    }
    
    // Helper: Emit message to specific users only
    async function emitToSpecificUsers(roomId, userIds, messageData) {
      // Get all sockets in the room
      const socketsInRoom = await io.in(roomId).fetchSockets();
      const sentToUsers = new Set();
      
      // Emit to users currently in the room
      for (const socket of socketsInRoom) {
        if (socket.userId && userIds.includes(socket.userId)) {
          socket.emit("groupMessageReceived", messageData);
          sentToUsers.add(socket.userId); 
        }
      }
      
      
    }

    socket.on("disconnect", () => {
      // Minimal disconnect logging
    });
  });
}

module.exports = initializeSocket;
