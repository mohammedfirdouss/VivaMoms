import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./auth";

// Register a new patient
export const registerPatient = mutation({
  args: {
    chw_id: v.id("users"),
    externalId: v.optional(v.string()),
    personalInfo: v.object({
      name: v.string(),
      age: v.number(),
      dateOfBirth: v.optional(v.number()),
      phone: v.optional(v.string()),
      village: v.string(),
      ward: v.optional(v.string()),
      lga: v.optional(v.string()),
      state: v.optional(v.string()),
      emergencyContact: v.optional(v.string()),
      nextOfKin: v.optional(v.string()),
    }),
    medicalInfo: v.object({
      bloodType: v.optional(v.string()),
      genotype: v.optional(v.string()),
      allergies: v.optional(v.array(v.string())),
      chronicConditions: v.optional(v.array(v.string())),
      currentMedications: v.optional(v.array(v.string())),
      lastMenstrualPeriod: v.optional(v.number()),
      pregnancyWeek: v.optional(v.number()),
      deliveryDate: v.optional(v.number()),
      gravida: v.optional(v.number()),
      para: v.optional(v.number()),
    }),
    consentInfo: v.object({
      dataProcessingConsent: v.boolean(),
      treatmentConsent: v.boolean(),
      emergencyContactConsent: v.boolean(),
      consentDate: v.number(),
      consentWitness: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "admin"]);
    
    // CHWs can only register patients for themselves
    if (user.role === "chw" && user._id !== args.chw_id) {
      throw new Error("CHWs can only register patients for themselves");
    }

    const patientData = {
      chw_id: args.chw_id,
      externalId: args.externalId,
      personalInfo: args.personalInfo,
      medicalInfo: args.medicalInfo,
      consentInfo: args.consentInfo,
      isActive: true,
      registrationDate: Date.now(),
    };

    return await ctx.db.insert("patients", patientData);
  },
});

// Get all patients for a CHW
export const getPatientsByCHW = query({
  args: {
    chw_id: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    // CHWs can only see their own patients
    if (user.role === "chw" && user._id !== args.chw_id) {
      throw new Error("CHWs can only view their own patients");
    }

    const query = ctx.db
      .query("patients")
      .filter((q) => 
        q.and(
          q.eq(q.field("chw_id"), args.chw_id),
          q.eq(q.field("isActive"), true)
        )
      );

    if (args.offset) {
      query.skip(args.offset);
    }
    
    if (args.limit) {
      query.take(args.limit);
    }

    return await query.collect();
  },
});

// Get patient by ID
export const getPatientById = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // CHWs can only view their own patients
    if (user.role === "chw" && user._id !== patient.chw_id) {
      throw new Error("Access denied");
    }

    return patient;
  },
});

// Search patients by name or village
export const searchPatients = query({
  args: {
    searchTerm: v.string(),
    chw_id: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("isActive"), true));

    // If CHW is specified and user is CHW, ensure they can only search their patients
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only search their own patients");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their patients
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    const patients = await query.collect();
    
    // Filter by search term (name or village)
    const filteredPatients = patients.filter(patient => 
      patient.personalInfo.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
      patient.personalInfo.village.toLowerCase().includes(args.searchTerm.toLowerCase())
    );

    return args.limit ? filteredPatients.slice(0, args.limit) : filteredPatients;
  },
});

// Update patient information
export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    personalInfo: v.optional(v.object({
      name: v.string(),
      age: v.number(),
      dateOfBirth: v.optional(v.number()),
      phone: v.optional(v.string()),
      village: v.string(),
      ward: v.optional(v.string()),
      lga: v.optional(v.string()),
      state: v.optional(v.string()),
      emergencyContact: v.optional(v.string()),
      nextOfKin: v.optional(v.string()),
    })),
    medicalInfo: v.optional(v.object({
      bloodType: v.optional(v.string()),
      genotype: v.optional(v.string()),
      allergies: v.optional(v.array(v.string())),
      chronicConditions: v.optional(v.array(v.string())),
      currentMedications: v.optional(v.array(v.string())),
      lastMenstrualPeriod: v.optional(v.number()),
      pregnancyWeek: v.optional(v.number()),
      deliveryDate: v.optional(v.number()),
      gravida: v.optional(v.number()),
      para: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // CHWs can only update their own patients
    if (user.role === "chw" && user._id !== patient.chw_id) {
      throw new Error("CHWs can only update their own patients");
    }

    const updateData: any = {};
    if (args.personalInfo) {
      updateData.personalInfo = args.personalInfo;
    }
    if (args.medicalInfo) {
      updateData.medicalInfo = args.medicalInfo;
    }

    await ctx.db.patch(args.patientId, updateData);
  },
});

// Deactivate patient
export const deactivatePatient = mutation({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "admin"]);
    
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // CHWs can only deactivate their own patients
    if (user.role === "chw" && user._id !== patient.chw_id) {
      throw new Error("CHWs can only deactivate their own patients");
    }

    await ctx.db.patch(args.patientId, {
      isActive: false,
    });
  },
});

// Get patients by village
export const getPatientsByVillage = query({
  args: {
    village: v.string(),
    chw_id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("patients")
      .filter((q) => 
        q.and(
          q.eq(q.field("personalInfo.village"), args.village),
          q.eq(q.field("isActive"), true)
        )
      );

    // If CHW is specified and user is CHW, ensure they can only see their patients
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own patients");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their patients
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    return await query.collect();
  },
});

// Get patient statistics
export const getPatientStats = query({
  args: {
    chw_id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    
    let query = ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("isActive"), true));

    // If CHW is specified and user is CHW, ensure they can only see their stats
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own statistics");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their patients
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    const patients = await query.collect();
    
    const stats = {
      totalPatients: patients.length,
      pregnantWomen: patients.filter(p => p.medicalInfo.pregnancyWeek && p.medicalInfo.pregnancyWeek > 0).length,
      newMothers: patients.filter(p => {
        const deliveryDate = p.medicalInfo.deliveryDate;
        if (!deliveryDate) return false;
        const sixWeeksAgo = Date.now() - (6 * 7 * 24 * 60 * 60 * 1000);
        return deliveryDate > sixWeeksAgo;
      }).length,
      chronicConditions: patients.filter(p => p.medicalInfo.chronicConditions && p.medicalInfo.chronicConditions.length > 0).length,
      villages: [...new Set(patients.map(p => p.personalInfo.village))].length,
    };

    return stats;
  },
});

// Get recent patient registrations
export const getRecentRegistrations = query({
  args: {
    days: v.optional(v.number()),
    chw_id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["chw", "doctor", "admin"]);
    const days = args.days || 7;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db
      .query("patients")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.gte(q.field("registrationDate"), cutoffDate)
        )
      );

    // If CHW is specified and user is CHW, ensure they can only see their patients
    if (args.chw_id) {
      if (user.role === "chw" && user._id !== args.chw_id) {
        throw new Error("CHWs can only view their own patients");
      }
      query = query.filter((q) => q.eq(q.field("chw_id"), args.chw_id));
    } else if (user.role === "chw") {
      // If no CHW specified and user is CHW, default to their patients
      query = query.filter((q) => q.eq(q.field("chw_id"), user._id));
    }

    return await query.collect();
  },
});

