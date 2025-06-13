import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";
import { validateFile } from "./security";

// Upload a file
export const uploadFile = mutation({
  args: {
    file: v.bytes(),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    linkedResource: v.optional(v.object({
      type: v.string(), // e.g., "message", "test", etc.
      id: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    validateFile(args.file, args.fileName, args.mimeType, args.fileSize);
    const storageId = await ctx.storage.store(args.file);
    // Optionally link to a resource (e.g., message, test)
    // Store metadata in a custom table if needed
    return {
      storageId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
    };
  },
});

// Download a file by storage ID
export const downloadFile = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    const file = await ctx.storage.get(args.storageId);
    if (!file) throw new Error("File not found");
    return file;
  },
});

// Delete a file by storage ID
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin"]);
    await ctx.storage.delete(args.storageId);
    // Optionally remove metadata if stored elsewhere
    return { success: true };
  },
});

// Get file metadata (stub, extend as needed)
export const getFileMetadata = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // If you store metadata in a table, fetch it here
    // For now, just return storageId
    return { storageId: args.storageId };
  },
}); 