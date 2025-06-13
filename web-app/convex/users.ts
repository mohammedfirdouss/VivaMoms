import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./auth";

// Get all users with filtering
export const getUsers = query({
  args: {
    role: v.optional(v.union(v.literal("doctor"), v.literal("chw"), v.literal("admin"))),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    let query = ctx.db.query("users");

    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    if (args.offset) {
      query = query.skip(args.offset);
    }
    
    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Users can view their own profile, admins can view all
    if (currentUser.role !== "admin" && currentUser._id !== args.userId) {
      // CHWs and doctors can view basic info of other users they work with
      return {
        _id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        profile: {
          specialization: user.profile?.specialization,
          location: user.profile?.location,
        },
      };
    }

    return user;
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    profile: v.optional(v.object({
      phone: v.optional(v.string()),
      specialization: v.optional(v.string()),
      location: v.optional(v.string()),
      licenseNumber: v.optional(v.string()),
      yearsOfExperience: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Users can only update their own profile unless they're admin
    if (currentUser.role !== "admin" && currentUser._id !== args.userId) {
      throw new Error("You can only update your own profile");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {};
    
    if (args.name) {
      updateData.name = args.name;
    }
    
    if (args.profile) {
      updateData.profile = {
        ...user.profile,
        ...args.profile,
      };
    }

    await ctx.db.patch(args.userId, updateData);
  },
});

// Activate/Deactivate user
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
    });
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("doctor"), v.literal("chw"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
    });
  },
});

// Search users
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    role: v.optional(v.union(v.literal("doctor"), v.literal("chw"), v.literal("admin"))),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db.query("users");

    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    const users = await query.collect();
    
    // Filter by search term (name, email, or location)
    const filteredUsers = users.filter(user => {
      const searchLower = args.searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.profile?.location?.toLowerCase().includes(searchLower) ||
        user.profile?.specialization?.toLowerCase().includes(searchLower)
      );
    });

    // Return limited info for non-admin users
    if (currentUser.role !== "admin") {
      const limitedUsers = filteredUsers.map(user => ({
        _id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        profile: {
          specialization: user.profile?.specialization,
          location: user.profile?.location,
        },
      }));
      return args.limit ? limitedUsers.slice(0, args.limit) : limitedUsers;
    }

    return args.limit ? filteredUsers.slice(0, args.limit) : filteredUsers;
  },
});

// Get user statistics
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    
    const users = await ctx.db.query("users").collect();
    
    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      doctors: users.filter(u => u.role === "doctor").length,
      chws: users.filter(u => u.role === "chw").length,
      admins: users.filter(u => u.role === "admin").length,
      activeDoctors: users.filter(u => u.role === "doctor" && u.isActive).length,
      activeCHWs: users.filter(u => u.role === "chw" && u.isActive).length,
      recentLogins: users.filter(u => {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return u.lastLogin && u.lastLogin > sevenDaysAgo;
      }).length,
    };

    return stats;
  },
});

// Get doctors by specialization
export const getDoctorsBySpecialization = query({
  args: {
    specialization: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "doctor"));

    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    const doctors = await query.collect();
    
    // Filter by specialization
    const filteredDoctors = doctors.filter(doctor => 
      doctor.profile?.specialization?.toLowerCase().includes(args.specialization.toLowerCase())
    );

    return filteredDoctors;
  },
});

// Get CHWs by location
export const getCHWsByLocation = query({
  args: {
    location: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["doctor", "admin"]);
    
    let query = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "chw"));

    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    const chws = await query.collect();
    
    // Filter by location
    const filteredCHWs = chws.filter(chw => 
      chw.profile?.location?.toLowerCase().includes(args.location.toLowerCase())
    );

    return filteredCHWs;
  },
});

// Get recent user registrations
export const getRecentRegistrations = query({
  args: {
    days: v.optional(v.number()),
    role: v.optional(v.union(v.literal("doctor"), v.literal("chw"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const days = args.days || 30;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), cutoffDate));

    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    return await query.collect();
  },
});

// Get user activity summary
export const getUserActivity = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Users can only view their own activity unless they're admin
    if (currentUser.role !== "admin" && currentUser._id !== args.userId) {
      throw new Error("You can only view your own activity");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const days = args.days || 30;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    let activity: any = {
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    };

    if (user.role === "chw") {
      // Get CHW activity
      const patients = await ctx.db
        .query("patients")
        .filter((q) => 
          q.and(
            q.eq(q.field("chw_id"), args.userId),
            q.gte(q.field("registrationDate"), cutoffDate)
          )
        )
        .collect();

      const encounters = await ctx.db
        .query("encounters")
        .filter((q) => 
          q.and(
            q.eq(q.field("chw_id"), args.userId),
            q.gte(q.field("encounterDate"), cutoffDate)
          )
        )
        .collect();

      const consultations = await ctx.db
        .query("consultations")
        .filter((q) => 
          q.and(
            q.eq(q.field("chw_id"), args.userId),
            q.gte(q.field("requestedAt"), cutoffDate)
          )
        )
        .collect();

      activity.chw = {
        patientsRegistered: patients.length,
        encountersCreated: encounters.length,
        consultationsRequested: consultations.length,
        urgentEncounters: encounters.filter(e => e.urgencyLevel === "high" || e.urgencyLevel === "critical").length,
      };
    } else if (user.role === "doctor") {
      // Get doctor activity
      const consultations = await ctx.db
        .query("consultations")
        .filter((q) => 
          q.and(
            q.eq(q.field("doctor_id"), args.userId),
            q.gte(q.field("requestedAt"), cutoffDate)
          )
        )
        .collect();

      const messages = await ctx.db
        .query("messages")
        .filter((q) => 
          q.and(
            q.eq(q.field("sender_id"), args.userId),
            q.gte(q.field("sentAt"), cutoffDate)
          )
        )
        .collect();

      activity.doctor = {
        consultationsHandled: consultations.length,
        consultationsCompleted: consultations.filter(c => c.status === "completed").length,
        messagesSent: messages.length,
        averageConsultationTime: consultations
          .filter(c => c.duration)
          .reduce((sum, c) => sum + (c.duration || 0), 0) / 
          consultations.filter(c => c.duration).length || 0,
      };
    }

    return activity;
  },
});

// Update user last login
export const updateLastLogin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Users can only update their own last login unless they're admin
    if (currentUser.role !== "admin" && currentUser._id !== args.userId) {
      throw new Error("You can only update your own login time");
    }
    
    await ctx.db.patch(args.userId, {
      lastLogin: Date.now(),
    });
  },
});

// Get user workload (for doctors)
export const getDoctorWorkload = query({
  args: {
    doctorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["doctor", "admin"]);
    
    // Doctors can only view their own workload unless they're admin
    if (currentUser.role !== "admin" && currentUser._id !== args.doctorId) {
      throw new Error("You can only view your own workload");
    }

    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor || doctor.role !== "doctor") {
      throw new Error("Doctor not found");
    }

    // Get current consultations
    const activeConsultations = await ctx.db
      .query("consultations")
      .filter((q) => 
        q.and(
          q.eq(q.field("doctor_id"), args.doctorId),
          q.or(
            q.eq(q.field("status"), "assigned"),
            q.eq(q.field("status"), "in_progress")
          )
        )
      )
      .collect();

    // Get pending consultations that could be assigned
    const pendingConsultations = await ctx.db
      .query("consultations")
      .filter((q) => q.eq(q.field("status"), "requested"))
      .collect();

    const workload = {
      activeConsultations: activeConsultations.length,
      inProgress: activeConsultations.filter(c => c.status === "in_progress").length,
      assigned: activeConsultations.filter(c => c.status === "assigned").length,
      pendingAvailable: pendingConsultations.length,
      emergencyPending: pendingConsultations.filter(c => c.priority === "emergency").length,
      urgentPending: pendingConsultations.filter(c => c.priority === "urgent").length,
    };

    return workload;
  },
});

