// Security utilities for file handling and validation

// Allowed file types and max size (customize as needed)
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  // Add more as needed
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate file before upload.
 * Throws error if invalid.
 */
export function validateFile(
  file: ArrayBuffer,
  fileName: string,
  mimeType: string,
  fileSize: number
) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("File type not allowed");
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size exceeds limit");
  }
  // Add more checks (e.g., file name, virus scan stub) as needed
}

/**
 * Stub for virus scanning (to be implemented with external service)
 */
export async function scanFileForViruses(_file: ArrayBuffer): Promise<boolean> {
  // Integrate with a real virus scanning service in production
  return true;
}

/**
 * Audit log stub (extend as needed)
 */
export function logSecurityEvent(event: string, details: any = {}) {
  // In production, send to security monitoring service or audit log
  console.log("Security Event:", { event, ...details });
} 