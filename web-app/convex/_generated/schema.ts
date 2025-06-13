import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - Doctors, CHWs, Admins
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("doctor"), v.literal("chw"), v.literal("admin")),
    isActive: v.boolean(),
    profile: v.object({
      phone: v.optional(v.string()),
      specialization: v.optional(v.string()), // for doctors
      location: v.optional(v.string()), // for CHWs
      licenseNumber: v.optional(v.string()), // for doctors
      yearsOfExperience: v.optional(v.number()),
    }),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  // Patients table
  patients: defineTable({
    chw_id: v.id("users"),
    externalId: v.optional(v.string()), // For linking with external systems
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
      gravida: v.optional(v.number()), // Number of pregnancies
      para: v.optional(v.number()), // Number of births
    }),
    consentInfo: v.object({
      dataProcessingConsent: v.boolean(),
      treatmentConsent: v.boolean(),
      emergencyContactConsent: v.boolean(),
      consentDate: v.number(),
      consentWitness: v.optional(v.string()),
    }),
    isActive: v.boolean(),
    registrationDate: v.number(),
  })
    .index("by_chw", ["chw_id"])
    .index("by_active", ["isActive"])
    .index("by_village", ["personalInfo.village"]),

  // Medical encounters
  encounters: defineTable({
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
    status: v.union(
      v.literal("pending"),
      v.literal("in_consultation"),
      v.literal("completed"),
      v.literal("cancelled")
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
    submittedAt: v.number(),
  })
    .index("by_patient", ["patient_id"])
    .index("by_chw", ["chw_id"])
    .index("by_status", ["status"])
    .index("by_urgency", ["urgencyLevel"])
    .index("by_date", ["encounterDate"]),

  // Medical tests and diagnostics
  tests: defineTable({
    encounter_id: v.id("encounters"),
    patient_id: v.id("patients"),
    chw_id: v.id("users"),
    testType: v.union(
      v.literal("rdt_malaria"),
      v.literal("rdt_hiv"),
      v.literal("blood_glucose"),
      v.literal("urine_protein"),
      v.literal("urine_glucose"),
      v.literal("hemoglobin"),
      v.literal("pregnancy_test"),
      v.literal("other")
    ),
    testName: v.string(),
    result: v.string(),
    interpretation: v.optional(v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("normal"),
      v.literal("abnormal"),
      v.literal("inconclusive")
    )),
    referenceRange: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")), // For test strip photos
    notes: v.optional(v.string()),
    testDate: v.number(),
    resultDate: v.number(),
  })
    .index("by_encounter", ["encounter_id"])
    .index("by_patient", ["patient_id"])
    .index("by_test_type", ["testType"]),

  // Doctor consultations
  consultations: defineTable({
    encounter_id: v.id("encounters"),
    patient_id: v.id("patients"),
    chw_id: v.id("users"),
    doctor_id: v.optional(v.id("users")), // Assigned doctor
    status: v.union(
      v.literal("requested"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
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
    requestedAt: v.number(),
    assignedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    
    // Doctor's clinical assessment
    doctorAssessment: v.optional(v.object({
      clinicalImpression: v.string(),
      differentialDiagnosis: v.optional(v.array(v.string())),
      workingDiagnosis: v.optional(v.string()),
      severity: v.optional(v.union(
        v.literal("mild"),
        v.literal("moderate"),
        v.literal("severe")
      )),
    })),
    
    // Treatment recommendations
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
    
    // Follow-up requirements
    followUp: v.optional(v.object({
      required: v.boolean(),
      timeframe: v.optional(v.string()),
      scheduledDate: v.optional(v.number()),
      instructions: v.optional(v.string()),
    })),
    
    // Referral information
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
    duration: v.optional(v.number()), // Duration in minutes
  })
    .index("by_encounter", ["encounter_id"])
    .index("by_patient", ["patient_id"])
    .index("by_chw", ["chw_id"])
    .index("by_doctor", ["doctor_id"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_requested_at", ["requestedAt"]),

  // Real-time messaging
  messages: defineTable({
    consultation_id: v.id("consultations"),
    thread_id: v.optional(v.string()), // For message threading
    sender_id: v.id("users"),
    recipient_id: v.id("users"),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("audio"),
      v.literal("file"),
      v.literal("system")
    ),
    content: v.string(),
    attachmentStorageId: v.optional(v.id("_storage")),
    attachmentMetadata: v.optional(v.object({
      fileName: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
    })),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    sentAt: v.number(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
  })
    .index("by_consultation", ["consultation_id"])
    .index("by_sender", ["sender_id"])
    .index("by_recipient", ["recipient_id"])
    .index("by_sent_at", ["sentAt"]),

  // System notifications
  notifications: defineTable({
    user_id: v.id("users"),
    type: v.union(
      v.literal("new_consultation"),
      v.literal("urgent_patient"),
      v.literal("message_received"),
      v.literal("system_alert"),
      v.literal("reminder")
    ),
    title: v.string(),
    content: v.string(),
    data: v.optional(v.object({
      consultation_id: v.optional(v.id("consultations")),
      patient_id: v.optional(v.id("patients")),
      encounter_id: v.optional(v.id("encounters")),
    })),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_type", ["type"])
    .index("by_read", ["isRead"]),

  // Audit logs for NDPR compliance
  auditLogs: defineTable({
    user_id: v.optional(v.id("users")),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
      metadata: v.optional(v.any()),
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_action", ["action"])
    .index("by_resource", ["resourceType"])
    .index("by_timestamp", ["timestamp"]),

  // System configuration
  systemConfig: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
