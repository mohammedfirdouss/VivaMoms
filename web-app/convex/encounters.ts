import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./auth";

// Create a new medical encounter
export const createEncounter = mutation({
  args: {
    patient_id: v.id("patients"),
    chw_id: v.id("users"),
    encounterType: v.union(
      v.literal("antenatal"),
      v.literal("postnatal"),
      v.literal("newborn"),
      v.literal("child_health"),
      v.literal("family_planning"),
      v.literal("emergency")
    ),
    vitals: v.object({
      bloodPressure: v.optional(v.object({
        systolic: v.number(),
        diastolic: v.number(),
        timestamp: v.number(),
      })),
      heartRate: v.optional(v.object({
        value: v.number(),
        timestamp: v.number(),
      })),
      temperature: v.optional(v.object({
        value: v.number(),
        unit: v.union(v.literal("celsius"), v.literal("fahrenheit")),
        timestamp: v.number(),
      })),
      weight: v.optional(v.object({
        value: v.number(),
        unit: v.literal("kg"),
        timestamp: v.number(),
      })),
      height: v.optional(v.object({
        value: v.number(),
        unit: v.literal("cm"),
        timestamp: v.number(),
      })),
      respiratoryRate: v.optional(v.object({
        value: v.number(),
        timestamp: v.number(),
      })),
      oxygenSaturation: v.optional(v.object({
        value: v.number(),
        timestamp: v.number(),
      })),
    }),
    symptoms: v.optional(v.array(v.string())),
    chiefComplaint: v.optional(v.string()),
    historyOfPresentIllness: v.optional(v.string()),
    physicalExamination: v.optional(v.string()),
    chmNotes: v.optional(v.string()),
    urgencyLevel: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    location: v.object({
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      address: v.string(),
    }),
    encounterDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "admin"]);
    
    // CHWs can only create encounters for themselves
    if (user.role === "chw" && user._id !== args.chw_id) {
      throw new Error("CHWs can only create encounters for themselves");
    }

    // Verify the patient exists and belongs to the CHW
    const patient = await ctx.db.get(args.patient_id);
    if (!patient) {
      throw new Error("Patient not found");
    }
    
    if (patient.chw_id !== args.chw_id) {
      throw new Error("Patient does not belong to the specified CHW");
    }

    const encounterData = {
      patient_id: args.patient_id,
      chw_id: args.chw_id,
      encounterType: args.encounterType,
      status: "pending" as const,
      vitals: args.vitals,
      symptoms: args.symptoms,
      chiefComplaint: args.chiefComplaint,
      historyOfPresentIllness: args.historyOfPresentIllness,
      physicalExamination: args.physicalExamination,
      chmNotes: args.chmNotes,
      urgencyLevel: args.urgencyLevel,
      location: args.location,
      encounterDate: args.encounterDate,
      submittedAt: Date.now(),
    };

    return await ctx.db.insert("encounters", encounterData);
  },
});

// Update encounter status
export const updateEncounterStatus = mutation({
  args: {
    encounterId: v.id("encounters"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_consultation"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const encounter = await ctx.db.get(args.encounterId);
    if (!encounter) {
      throw new Error("Encounter not found");
    }

    // CHWs can only update their own encounters
    if (user.role === "chw" && user._id !== encounter.chw_id) {
      throw new Error("CHWs can only update their own encounters");
    }

    await ctx.db.patch(args.encounterId, {
      status: args.status,
    });
  },
});

// Update encounter details
export const updateEncounter = mutation({
  args: {
    encounterId: v.id("encounters"),
    vitals: v.optional(v.object({
      bloodPressure: v.optional(v.object({
        systolic: v.number(),
        diastolic: v.number(),
        timestamp: v.number(),
      })),
      heartRate: v.optional(v.object({
        value: v.number(),
        timestamp: v.number(),
      })),
      temperature: v.optional(v.object({
        value: v.number(),
        unit: v.union(v.literal("celsius"), v.literal("fahrenheit")),
        timestamp: v.number(),
      })),
      weight: v.optional(v.object({
        value: v.number(),
        unit: v.literal("kg"),
        timestamp: v.number(),
      })),
      height: v.optional(v.object({
        value: v.number(),
        unit: v.literal("cm"),
        timestamp: v.number(),
      })),
      respiratoryRate: v.optional(v.object({
        value: v.number(),
        timestamp: v.number(),
      })),
      oxygenSaturation: v.optional(v.object({
        value: v.number(),
        timestamp: v.number(),
      })),
    })),
    symptoms: v.optional(v.array(v.string())),
    chiefComplaint: v.optional(v.string()),
    historyOfPresentIllness: v.optional(v.string()),
    physicalExamination: v.optional(v.string()),
    chmNotes: v.optional(v.string()),
    urgencyLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "admin"]);
    
    const encounter = await ctx.db.get(args.encounterId);
    if (!encounter) {
      throw new Error("Encounter not found");
    }

    // CHWs can only update their own encounters
    if (user.role === "chw" && user._id !== encounter.chw_id) {
      throw new Error("CHWs can only update their own encounters");
    }

    // Cannot update completed or cancelled encounters
    if (encounter.status === "completed" || encounter.status === "cancelled") {
      throw new Error("Cannot update completed or cancelled encounters");
    }

    const updateData: any = {};
    if (args.vitals) updateData.vitals = args.vitals;
    if (args.symptoms) updateData.symptoms = args.symptoms;
    if (args.chiefComplaint) updateData.chiefComplaint = args.chiefComplaint;
    if (args.historyOfPresentIllness) updateData.historyOfPresentIllness = args.historyOfPresentIllness;
    if (args.physicalExamination) updateData.physicalExamination = args.physicalExamination;
    if (args.chmNotes) updateData.chmNotes = args.chmNotes;
    if (args.urgencyLevel) updateData.urgencyLevel = args.urgencyLevel;

    await ctx.db.patch(args.encounterId, updateData);
  },
});

// Get encounters for a patient
export const getEncountersForPatient = query({
  args: {
    patient_id: v.id("patients"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // Verify access to patient
    const patient = await ctx.db.get(args.patient_id);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // CHWs can only see encounters for their own patients
    if (user.role === "chw" && user._id !== patient.chw_id) {
      throw new Error("CHWs can only view encounters for their own patients");
    }

    let query = ctx.db
      .query("encounters")
      .filter((q) => q.eq(q.field("patient_id"), args.patient_id))
      .order("desc");

    if (args.offset) {
      query = query.skip(args.offset);
    }
    
    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Get encounters for a CHW
export const getEncountersForCHW = query({
  args: {
    chw_id: v.id("users"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("in_consultation"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    urgencyLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
    encounterType: v.optional(v.union(
      v.literal("antenatal"),
      v.literal("postnatal"),
      v.literal("newborn"),
      v.literal("child_health"),
      v.literal("family_planning"),
      v.literal("emergency")
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // CHWs can only see their own encounters
    if (user.role === "chw" && user._id !== args.chw_id) {
      throw new Error("CHWs can only view their own encounters");
    }

    let query = ctx.db
      .query("encounters")
      .filter((q) => q.eq(q.field("chw_id"), args.chw_id))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.urgencyLevel) {
      query = query.filter((q) => q.eq(q.field("urgencyLevel"), args.urgencyLevel));
    }

    if (args.encounterType) {
      query = query.filter((q) => q.eq(q.field("encounterType"), args.encounterType));
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

// Get encounter by ID with full details
export const getEncounterById = query({
  args: {
    encounterId: v.id("encounters"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const encounter = await ctx.db.get(args.encounterId);
    if (!encounter) {
      throw new Error("Encounter not found");
    }

    // CHWs can only view their own encounters
    if (user.role === "chw" && user._id !== encounter.chw_id) {
      throw new Error("CHWs can only view their own encounters");
    }

    // Get related data
    const patient = await ctx.db.get(encounter.patient_id);
    const chw = await ctx.db.get(encounter.chw_id);
    
    // Get associated tests
    const tests = await ctx.db
      .query("tests")
      .filter((q) => q.eq(q.field("encounter_id"), args.encounterId))
      .collect();

    // Get associated consultation
    const consultation = await ctx.db
      .query("consultations")
      .filter((q) => q.eq(q.field("encounter_id"), args.encounterId))
      .first();

    return {
      ...encounter,
      patient,
      chw,
      tests,
      consultation,
    };
  },
});

// Get urgent encounters
export const getUrgentEncounters = query({
  args: {
    chw_id: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("encounters")
      .filter((q) => 
        q.or(
          q.eq(q.field("urgencyLevel"), "high"),
          q.eq(q.field("urgencyLevel"), "critical")
        )
      )
      .order("desc");

    // If CHW is specified and user is CHW, ensure they can only see their encounters
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own encounters");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their encounters
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    if (args.limit) {
      query = query.take(args.limit);
    }

    const encounters = await query.collect();
    
    // Sort by urgency level (critical first) and then by encounter date
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    encounters.sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.encounterDate - a.encounterDate;
    });

    return encounters;
  },
});

// Get encounter statistics
export const getEncounterStats = query({
  args: {
    chw_id: v.optional(v.id("users")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    const days = args.days || 30;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db
      .query("encounters")
      .filter((q) => q.gte(q.field("encounterDate"), cutoffDate));

    // If CHW is specified and user is CHW, ensure they can only see their stats
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own statistics");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their encounters
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    const encounters = await query.collect();
    
    const stats = {
      total: encounters.length,
      pending: encounters.filter(e => e.status === "pending").length,
      inConsultation: encounters.filter(e => e.status === "in_consultation").length,
      completed: encounters.filter(e => e.status === "completed").length,
      cancelled: encounters.filter(e => e.status === "cancelled").length,
      critical: encounters.filter(e => e.urgencyLevel === "critical").length,
      high: encounters.filter(e => e.urgencyLevel === "high").length,
      medium: encounters.filter(e => e.urgencyLevel === "medium").length,
      low: encounters.filter(e => e.urgencyLevel === "low").length,
      antenatal: encounters.filter(e => e.encounterType === "antenatal").length,
      postnatal: encounters.filter(e => e.encounterType === "postnatal").length,
      newborn: encounters.filter(e => e.encounterType === "newborn").length,
      childHealth: encounters.filter(e => e.encounterType === "child_health").length,
      familyPlanning: encounters.filter(e => e.encounterType === "family_planning").length,
      emergency: encounters.filter(e => e.encounterType === "emergency").length,
    };

    return stats;
  },
});

// Get recent encounters
export const getRecentEncounters = query({
  args: {
    chw_id: v.optional(v.id("users")),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    const days = args.days || 7;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db
      .query("encounters")
      .filter((q) => q.gte(q.field("encounterDate"), cutoffDate))
      .order("desc");

    // If CHW is specified and user is CHW, ensure they can only see their encounters
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own encounters");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their encounters
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Search encounters
export const searchEncounters = query({
  args: {
    searchTerm: v.string(),
    chw_id: v.optional(v.id("users")),
    encounterType: v.optional(v.union(
      v.literal("antenatal"),
      v.literal("postnatal"),
      v.literal("newborn"),
      v.literal("child_health"),
      v.literal("family_planning"),
      v.literal("emergency")
    )),
    urgencyLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db.query("encounters");

    // If CHW is specified and user is CHW, ensure they can only search their encounters
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only search their own encounters");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their encounters
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    if (args.encounterType) {
      query = query.filter((q) => q.eq(q.field("encounterType"), args.encounterType));
    }

    if (args.urgencyLevel) {
      query = query.filter((q) => q.eq(q.field("urgencyLevel"), args.urgencyLevel));
    }

    const encounters = await query.collect();
    
    // Filter by search term (chief complaint, symptoms, or notes)
    const filteredEncounters = encounters.filter(encounter => {
      const searchLower = args.searchTerm.toLowerCase();
      return (
        encounter.chiefComplaint?.toLowerCase().includes(searchLower) ||
        encounter.historyOfPresentIllness?.toLowerCase().includes(searchLower) ||
        encounter.physicalExamination?.toLowerCase().includes(searchLower) ||
        encounter.chmNotes?.toLowerCase().includes(searchLower) ||
        encounter.symptoms?.some(symptom => symptom.toLowerCase().includes(searchLower))
      );
    });

    return args.limit ? filteredEncounters.slice(0, args.limit) : filteredEncounters;
  },
});

