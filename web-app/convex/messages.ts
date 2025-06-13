import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./auth";

// Send a message in a consultation
export const sendMessage = mutation({
  args: {
    consultation_id: v.id("consultations"),
    recipient_id: v.id("users"),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("audio"),
      v.literal("file"),
      v.literal("system")
    ),
    content: v.string(),
    thread_id: v.optional(v.string()),
    attachmentStorageId: v.optional(v.id("_storage")),
    attachmentMetadata: v.optional(v.object({
      fileName: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Verify the consultation exists and user has access
    const consultation = await ctx.db.get(args.consultation_id);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // Check if user is part of the consultation
    const isParticipant = 
      consultation.chw_id === user._id || 
      consultation.doctor_id === user._id ||
      user.role === "admin";

    if (!isParticipant) {
      throw new Error("You are not a participant in this consultation");
    }

    // Verify recipient is part of the consultation
    const isValidRecipient = 
      consultation.chw_id === args.recipient_id || 
      consultation.doctor_id === args.recipient_id;

    if (!isValidRecipient) {
      throw new Error("Recipient is not part of this consultation");
    }

    // Cannot send messages to yourself
    if (user._id === args.recipient_id) {
      throw new Error("Cannot send message to yourself");
    }

    const messageData = {
      consultation_id: args.consultation_id,
      thread_id: args.thread_id,
      sender_id: user._id,
      recipient_id: args.recipient_id,
      messageType: args.messageType,
      content: args.content,
      attachmentStorageId: args.attachmentStorageId,
      attachmentMetadata: args.attachmentMetadata,
      isRead: false,
      sentAt: Date.now(),
      isDeleted: false,
    };

    return await ctx.db.insert("messages", messageData);
  },
});

// Mark message as read
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the recipient can mark a message as read
    if (message.recipient_id !== user._id && user.role !== "admin") {
      throw new Error("You can only mark messages sent to you as read");
    }

    if (!message.isRead) {
      await ctx.db.patch(args.messageId, {
        isRead: true,
        readAt: Date.now(),
      });
    }
  },
});

// Mark multiple messages as read
export const markMessagesAsRead = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message && message.recipient_id === user._id && !message.isRead) {
        await ctx.db.patch(messageId, {
          isRead: true,
          readAt: Date.now(),
        });
      }
    }
  },
});

// Get messages for a consultation
export const getMessagesForConsultation = query({
  args: {
    consultation_id: v.id("consultations"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Verify the consultation exists and user has access
    const consultation = await ctx.db.get(args.consultation_id);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // Check if user is part of the consultation
    const isParticipant = 
      consultation.chw_id === user._id || 
      consultation.doctor_id === user._id ||
      user.role === "admin";

    if (!isParticipant) {
      throw new Error("You are not a participant in this consultation");
    }

    let query = ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("consultation_id"), args.consultation_id),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .order("asc");

    if (args.offset) {
      query = query.skip(args.offset);
    }
    
    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Get unread messages for a user
export const getUnreadMessages = query({
  args: {
    consultation_id: v.optional(v.id("consultations")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("recipient_id"), user._id),
          q.eq(q.field("isRead"), false),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .order("desc");

    if (args.consultation_id) {
      query = query.filter((q) => q.eq(q.field("consultation_id"), args.consultation_id));
    }

    return await query.collect();
  },
});

// Get unread message count
export const getUnreadMessageCount = query({
  args: {
    consultation_id: v.optional(v.id("consultations")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("recipient_id"), user._id),
          q.eq(q.field("isRead"), false),
          q.eq(q.field("isDeleted"), false)
        )
      );

    if (args.consultation_id) {
      query = query.filter((q) => q.eq(q.field("consultation_id"), args.consultation_id));
    }

    const messages = await query.collect();
    return messages.length;
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the sender can edit their message
    if (message.sender_id !== user._id && user.role !== "admin") {
      throw new Error("You can only edit your own messages");
    }

    // Cannot edit system messages
    if (message.messageType === "system") {
      throw new Error("Cannot edit system messages");
    }

    // Cannot edit messages older than 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (message.sentAt < twentyFourHoursAgo) {
      throw new Error("Cannot edit messages older than 24 hours");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the sender can delete their message
    if (message.sender_id !== user._id && user.role !== "admin") {
      throw new Error("You can only delete your own messages");
    }

    // Cannot delete system messages
    if (message.messageType === "system") {
      throw new Error("Cannot delete system messages");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "This message has been deleted",
    });
  },
});

// Get conversation between two users in a consultation
export const getConversation = query({
  args: {
    consultation_id: v.id("consultations"),
    other_user_id: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Verify the consultation exists and user has access
    const consultation = await ctx.db.get(args.consultation_id);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // Check if user is part of the consultation
    const isParticipant = 
      consultation.chw_id === user._id || 
      consultation.doctor_id === user._id ||
      user.role === "admin";

    if (!isParticipant) {
      throw new Error("You are not a participant in this consultation");
    }

    let query = ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("consultation_id"), args.consultation_id),
          q.eq(q.field("isDeleted"), false),
          q.or(
            q.and(
              q.eq(q.field("sender_id"), user._id),
              q.eq(q.field("recipient_id"), args.other_user_id)
            ),
            q.and(
              q.eq(q.field("sender_id"), args.other_user_id),
              q.eq(q.field("recipient_id"), user._id)
            )
          )
        )
      )
      .order("asc");

    if (args.offset) {
      query = query.skip(args.offset);
    }
    
    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Send system message
export const sendSystemMessage = mutation({
  args: {
    consultation_id: v.id("consultations"),
    recipient_id: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    // Verify the consultation exists
    const consultation = await ctx.db.get(args.consultation_id);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // Verify recipient is part of the consultation
    const isValidRecipient = 
      consultation.chw_id === args.recipient_id || 
      consultation.doctor_id === args.recipient_id;

    if (!isValidRecipient) {
      throw new Error("Recipient is not part of this consultation");
    }

    const messageData = {
      consultation_id: args.consultation_id,
      sender_id: args.recipient_id, // System messages appear to come from the recipient
      recipient_id: args.recipient_id,
      messageType: "system" as const,
      content: args.content,
      isRead: false,
      sentAt: Date.now(),
      isDeleted: false,
    };

    return await ctx.db.insert("messages", messageData);
  },
});

// Get message statistics
export const getMessageStats = query({
  args: {
    consultation_id: v.optional(v.id("consultations")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    const days = args.days || 30;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.gte(q.field("sentAt"), cutoffDate),
          q.eq(q.field("isDeleted"), false)
        )
      );

    if (args.consultation_id) {
      // Verify access to consultation
      const consultation = await ctx.db.get(args.consultation_id);
      if (!consultation) {
        throw new Error("Consultation not found");
      }

      const isParticipant = 
        consultation.chw_id === user._id || 
        consultation.doctor_id === user._id ||
        user.role === "admin";

      if (!isParticipant) {
        throw new Error("You are not a participant in this consultation");
      }

      query = query.filter((q) => q.eq(q.field("consultation_id"), args.consultation_id));
    } else {
      // Filter to messages where user is sender or recipient
      if (user.role !== "admin") {
        query = query.filter((q) => 
          q.or(
            q.eq(q.field("sender_id"), user._id),
            q.eq(q.field("recipient_id"), user._id)
          )
        );
      }
    }

    const messages = await query.collect();
    
    const stats = {
      total: messages.length,
      sent: messages.filter(m => m.sender_id === user._id).length,
      received: messages.filter(m => m.recipient_id === user._id).length,
      unread: messages.filter(m => m.recipient_id === user._id && !m.isRead).length,
      text: messages.filter(m => m.messageType === "text").length,
      image: messages.filter(m => m.messageType === "image").length,
      audio: messages.filter(m => m.messageType === "audio").length,
      file: messages.filter(m => m.messageType === "file").length,
      system: messages.filter(m => m.messageType === "system").length,
    };

    return stats;
  },
});

// Search messages
export const searchMessages = query({
  args: {
    searchTerm: v.string(),
    consultation_id: v.optional(v.id("consultations")),
    messageType: v.optional(v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("audio"),
      v.literal("file"),
      v.literal("system")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("isDeleted"), false));

    if (args.consultation_id) {
      // Verify access to consultation
      const consultation = await ctx.db.get(args.consultation_id);
      if (!consultation) {
        throw new Error("Consultation not found");
      }

      const isParticipant = 
        consultation.chw_id === user._id || 
        consultation.doctor_id === user._id ||
        user.role === "admin";

      if (!isParticipant) {
        throw new Error("You are not a participant in this consultation");
      }

      query = query.filter((q) => q.eq(q.field("consultation_id"), args.consultation_id));
    } else {
      // Filter to messages where user is sender or recipient
      if (user.role !== "admin") {
        query = query.filter((q) => 
          q.or(
            q.eq(q.field("sender_id"), user._id),
            q.eq(q.field("recipient_id"), user._id)
          )
        );
      }
    }

    if (args.messageType) {
      query = query.filter((q) => q.eq(q.field("messageType"), args.messageType));
    }

    const messages = await query.collect();
    
    // Filter by search term in content
    const filteredMessages = messages.filter(message => 
      message.content.toLowerCase().includes(args.searchTerm.toLowerCase())
    );

    // Sort by sent date (newest first)
    filteredMessages.sort((a, b) => b.sentAt - a.sentAt);

    return args.limit ? filteredMessages.slice(0, args.limit) : filteredMessages;
  },
});

// Get messages for the currently authenticated user
export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    // Find user by Clerk ID, then fetch messages
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) throw new Error("User not found");
    return await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.eq(q.field("sender_id"), user._id),
          q.eq(q.field("recipient_id"), user._id)
        )
      )
      .collect();
  },
});

