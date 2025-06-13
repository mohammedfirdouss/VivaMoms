import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Auth } from "convex/server";

// Get current user with role validation
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    return user;
  },
});

// Role-based access control middleware
export const requireRole = async (ctx: any, allowedRoles: string[]) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
  }

  return user;
};

// Create or update user profile
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("doctor"), v.literal("chw"), v.literal("admin")),
    profile: v.optional(v.object({
      phone: v.optional(v.string()),
      specialization: v.optional(v.string()),
      location: v.optional(v.string()),
      licenseNumber: v.optional(v.string()),
      yearsOfExperience: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    const userData = {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: args.role,
      isActive: true,
      profile: args.profile || {},
      lastLogin: Date.now(),
      createdAt: existingUser?.createdAt || Date.now(),
    };

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        ...userData,
        createdAt: existingUser.createdAt, // Keep original creation date
      });
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", userData);
    }
  },
});

// Update user last login
export const updateLastLogin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["doctor", "chw", "admin"]);
    
    await ctx.db.patch(args.userId, {
      lastLogin: Date.now(),
    });
  },
});

// Deactivate user account
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    await ctx.db.patch(args.userId, {
      isActive: false,
    });
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
});

// Get all active doctors
export const getActiveDoctors = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "chw"]);
    
    return await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("role"), "doctor"),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

// Get all active CHWs
export const getActiveCHWs = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "doctor"]);
    
    return await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("role"), "chw"),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    profile: v.object({
      phone: v.optional(v.string()),
      specialization: v.optional(v.string()),
      location: v.optional(v.string()),
      licenseNumber: v.optional(v.string()),
      yearsOfExperience: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["doctor", "chw", "admin"]);
    
    // Users can only update their own profile unless they're admin
    if (currentUser.role !== "admin" && currentUser._id !== args.userId) {
      throw new Error("You can only update your own profile");
    }
    
    await ctx.db.patch(args.userId, {
      profile: args.profile,
    });
  },
});

