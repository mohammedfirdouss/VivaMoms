import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./auth";

// Request a new consultation
export const requestConsultation = mutation({
  args: {
    encounter_id: v.id("encounters"),
    patient_id: v.id("patients"),
    chw_id: v.id("users"),
    priority: v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("emergency")
    ),
    consultationType: v.union(
      v.literal("text"),
      v.literal("audio"),
      v.literal("video")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "admin"]);
    
    // CHWs can only request consultations for their own encounters
    if (user.role === "chw" && user._id !== args.chw_id) {
      throw new Error("CHWs can only request consultations for their own encounters");
    }

    // Verify the encounter exists and belongs to the CHW
    const encounter = await ctx.db.get(args.encounter_id);
    if (!encounter) {
      throw new Error("Encounter not found");
    }
    
    if (encounter.chw_id !== args.chw_id) {
      throw new Error("Encounter does not belong to the specified CHW");
    }

    // Check if consultation already exists for this encounter
    const existingConsultation = await ctx.db
      .query("consultations")
      .filter((q) => q.eq(q.field("encounter_id"), args.encounter_id))
      .first();

    if (existingConsultation) {
      throw new Error("Consultation already exists for this encounter");
    }

    const consultationData = {
      encounter_id: args.encounter_id,
      patient_id: args.patient_id,
      chw_id: args.chw_id,
      status: "requested" as const,
      priority: args.priority,
      consultationType: args.consultationType,
      requestedAt: Date.now(),
    };

    return await ctx.db.insert("consultations", consultationData);
  },
});

// Assign consultation to a doctor
export const assignConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    doctor_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "doctor"]);
    
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    if (consultation.status !== "requested") {
      throw new Error("Consultation is not in requested status");
    }

    // Verify the doctor exists and is active
    const doctor = await ctx.db.get(args.doctor_id);
    if (!doctor || doctor.role !== "doctor" || !doctor.isActive) {
      throw new Error("Invalid doctor");
    }

    await ctx.db.patch(args.consultationId, {
      doctor_id: args.doctor_id,
      status: "assigned",
      assignedAt: Date.now(),
    });
  },
});

// Start consultation
export const startConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["doctor"]);
    
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    if (consultation.doctor_id !== user._id) {
      throw new Error("You can only start consultations assigned to you");
    }

    if (consultation.status !== "assigned") {
      throw new Error("Consultation is not in assigned status");
    }

    await ctx.db.patch(args.consultationId, {
      status: "in_progress",
      startedAt: Date.now(),
    });
  },
});

// Complete consultation with assessment and recommendations
export const completeConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    doctorAssessment: v.object({
      clinicalImpression: v.string(),
      differentialDiagnosis: v.optional(v.array(v.string())),
      workingDiagnosis: v.optional(v.string()),
      severity: v.optional(v.union(
        v.literal("mild"),
        v.literal("moderate"),
        v.literal("severe")
      )),
    }),
    recommendations: v.optional(v.object({
      treatment: v.array(v.string()),
      medications: v.optional(v.array(v.object({
        name: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        duration: v.string(),
        instructions: v.string(),
      }))),
      lifestyle: v.optional(v.array(v.string())),
      warnings: v.optional(v.array(v.string())),
    })),
    followUp: v.optional(v.object({
      required: v.boolean(),
      timeframe: v.optional(v.string()),
      scheduledDate: v.optional(v.number()),
      instructions: v.optional(v.string()),
    })),
    referral: v.optional(v.object({
      required: v.boolean(),
      facility: v.optional(v.string()),
      specialist: v.optional(v.string()),
      urgency: v.optional(v.union(
        v.literal("routine"),
        v.literal("urgent"),
        v.literal("emergency")
      )),
      reason: v.optional(v.string()),
    })),
    doctorNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["doctor"]);
    
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    if (consultation.doctor_id !== user._id) {
      throw new Error("You can only complete consultations assigned to you");
    }

    if (consultation.status !== "in_progress") {
      throw new Error("Consultation is not in progress");
    }

    const completedAt = Date.now();
    const duration = consultation.startedAt ? 
      Math.round((completedAt - consultation.startedAt) / (1000 * 60)) : undefined;

    await ctx.db.patch(args.consultationId, {
      status: "completed",
      completedAt,
      duration,
      doctorAssessment: args.doctorAssessment,
      recommendations: args.recommendations,
      followUp: args.followUp,
      referral: args.referral,
      doctorNotes: args.doctorNotes,
    });
  },
});

// Cancel consultation
export const cancelConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // CHWs can only cancel their own consultations
    if (user.role === "chw" && user._id !== consultation.chw_id) {
      throw new Error("CHWs can only cancel their own consultations");
    }

    // Doctors can only cancel consultations assigned to them
    if (user.role === "doctor" && user._id !== consultation.doctor_id) {
      throw new Error("Doctors can only cancel consultations assigned to them");
    }

    if (consultation.status === "completed" || consultation.status === "cancelled") {
      throw new Error("Cannot cancel a completed or already cancelled consultation");
    }

    await ctx.db.patch(args.consultationId, {
      status: "cancelled",
      doctorNotes: args.reason ? `Cancelled: ${args.reason}` : "Cancelled",
    });
  },
});

// Get consultations for a doctor
export const getConsultationsForDoctor = query({
  args: {
    doctor_id: v.id("users"),
    status: v.optional(v.union(
      v.literal("requested"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["doctor", "admin"]);
    
    // Doctors can only see their own consultations
    if (user.role === "doctor" && user._id !== args.doctor_id) {
      throw new Error("Doctors can only view their own consultations");
    }

    let query = ctx.db
      .query("consultations")
      .filter((q) => q.eq(q.field("doctor_id"), args.doctor_id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
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

// Get consultations for a CHW
export const getConsultationsForCHW = query({
  args: {
    chw_id: v.id("users"),
    status: v.optional(v.union(
      v.literal("requested"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // CHWs can only see their own consultations
    if (user.role === "chw" && user._id !== args.chw_id) {
      throw new Error("CHWs can only view their own consultations");
    }

    let query = ctx.db
      .query("consultations")
      .filter((q) => q.eq(q.field("chw_id"), args.chw_id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
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

// Get pending consultations (for assignment)
export const getPendingConsultations = query({
  args: {
    priority: v.optional(v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("emergency")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["doctor", "admin"]);
    
    let query = ctx.db
      .query("consultations")
      .filter((q) => q.eq(q.field("status"), "requested"));

    if (args.priority) {
      query = query.filter((q) => q.eq(q.field("priority"), args.priority));
    }

    // Order by priority (emergency first) and then by request time
    const consultations = await query.collect();
    
    const priorityOrder = { emergency: 0, urgent: 1, routine: 2 };
    consultations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.requestedAt - b.requestedAt;
    });

    return args.limit ? consultations.slice(0, args.limit) : consultations;
  },
});

// Get consultation by ID with full details
export const getConsultationById = query({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // Check access permissions
    if (user.role === "chw" && user._id !== consultation.chw_id) {
      throw new Error("CHWs can only view their own consultations");
    }
    
    if (user.role === "doctor" && user._id !== consultation.doctor_id) {
      throw new Error("Doctors can only view consultations assigned to them");
    }

    // Get related data
    const patient = await ctx.db.get(consultation.patient_id);
    const encounter = await ctx.db.get(consultation.encounter_id);
    const chw = await ctx.db.get(consultation.chw_id);
    const doctor = consultation.doctor_id ? await ctx.db.get(consultation.doctor_id) : null;

    return {
      ...consultation,
      patient,
      encounter,
      chw,
      doctor,
    };
  },
});

// Get consultation statistics
export const getConsultationStats = query({
  args: {
    doctor_id: v.optional(v.id("users")),
    chw_id: v.optional(v.id("users")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    const days = args.days || 30;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db
      .query("consultations")
      .filter((q) => q.gte(q.field("requestedAt"), cutoffDate));

    // Apply filters based on user role and parameters
    if (args.doctor_id) {
      if (user.role === "doctor" && user._id !== args.doctor_id) {
        throw new Error("Doctors can only view their own statistics");
      }
      query = query.filter((q) => q.eq(q.field("doctor_id"), args.doctor_id));
    } else if (user.role === "doctor") {
      query = query.filter((q) => q.eq(q.field("doctor_id"), user._id));
    }

    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own statistics");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    const consultations = await query.collect();
    
    const stats = {
      total: consultations.length,
      requested: consultations.filter(c => c.status === "requested").length,
      assigned: consultations.filter(c => c.status === "assigned").length,
      inProgress: consultations.filter(c => c.status === "in_progress").length,
      completed: consultations.filter(c => c.status === "completed").length,
      cancelled: consultations.filter(c => c.status === "cancelled").length,
      emergency: consultations.filter(c => c.priority === "emergency").length,
      urgent: consultations.filter(c => c.priority === "urgent").length,
      routine: consultations.filter(c => c.priority === "routine").length,
      averageDuration: consultations
        .filter(c => c.duration)
        .reduce((sum, c) => sum + (c.duration || 0), 0) / 
        consultations.filter(c => c.duration).length || 0,
    };

    return stats;
  },
});

// Update consultation priority
export const updateConsultationPriority = mutation({
  args: {
    consultationId: v.id("consultations"),
    priority: v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("emergency")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    // CHWs can only update their own consultations
    if (user.role === "chw" && user._id !== consultation.chw_id) {
      throw new Error("CHWs can only update their own consultations");
    }

    // Doctors can only update consultations assigned to them
    if (user.role === "doctor" && user._id !== consultation.doctor_id) {
      throw new Error("Doctors can only update consultations assigned to them");
    }

    if (consultation.status === "completed" || consultation.status === "cancelled") {
      throw new Error("Cannot update priority of completed or cancelled consultation");
    }

    await ctx.db.patch(args.consultationId, {
      priority: args.priority,
    });
  },
});

