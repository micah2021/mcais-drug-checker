const NAFDAC_CODE_PATTERN = /^[A-Z0-9-]{4,20}$/;
const MAX_NAFDAC_INPUT_LENGTH = 40;
const MAX_TEXT_LENGTH = 1000;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const REPORTS_STORAGE_KEY = "mcais.fake_drug_reports.v1";

const KNOWN_NAFDAC_CODES = new Set(["A4-0001", "B2-1122", "C1-9044"]);

export const VERIFICATION_STATUS = {
  AUTHENTIC: "authentic",
  SUSPECT: "suspect",
  UNKNOWN: "unknown",
  PENDING_REVIEW: "pending_review",
};

export function normalizeNafdacCode(input = "") {
  const trimmed = String(input).trim().toUpperCase();
  const sanitized = trimmed.replace(/[^A-Z0-9-]/g, "").replace(/-+/g, "-");
  return sanitized;
}

export function validateNafdacCode(input = "", { required = true } = {}) {
  const raw = String(input || "").trim();
  if (!raw) {
    return required ? { valid: false, error: "NAFDAC code is required." } : { valid: true, normalized: "" };
  }
  if (raw.length > MAX_NAFDAC_INPUT_LENGTH) {
    return { valid: false, error: `NAFDAC code is too long (max ${MAX_NAFDAC_INPUT_LENGTH} chars).` };
  }

  const normalized = normalizeNafdacCode(raw);
  if (!normalized || !NAFDAC_CODE_PATTERN.test(normalized)) {
    return { valid: false, error: "Enter a valid NAFDAC code (letters, numbers, and hyphen only)." };
  }
  return { valid: true, normalized };
}

export function validateImageFile(file) {
  if (!file) return { valid: true, metadata: null };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPG, PNG, or WEBP images are allowed." };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: "Image is too large. Maximum size is 5MB." };
  }
  return {
    valid: true,
    metadata: {
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_at: new Date().toISOString(),
    },
  };
}

export function verifyAuthenticity({ nafdacCode, imageFile } = {}) {
  const codeValidation = validateNafdacCode(nafdacCode, { required: true });
  const imageValidation = validateImageFile(imageFile);

  const response = {
    status: VERIFICATION_STATUS.UNKNOWN,
    normalized_code: codeValidation.normalized || null,
    message: "Code format looks valid, but we cannot confirm authenticity yet.",
    image: {
      received: Boolean(imageFile),
      queued_for_review: false,
      metadata: imageValidation.metadata,
    },
    errors: [],
  };

  if (!codeValidation.valid) {
    response.status = VERIFICATION_STATUS.SUSPECT;
    response.message = "Code format looks suspicious. Please re-check and buy from registered pharmacies.";
    response.errors.push(codeValidation.error);
    return response;
  }

  if (!imageValidation.valid) {
    response.status = VERIFICATION_STATUS.SUSPECT;
    response.message = "Image upload failed validation.";
    response.errors.push(imageValidation.error);
    return response;
  }

  if (KNOWN_NAFDAC_CODES.has(codeValidation.normalized)) {
    response.status = VERIFICATION_STATUS.AUTHENTIC;
    response.message = "Code matches a known sample registry entry. Keep checking packaging details and expiry date.";
  }

  if (imageValidation.metadata) {
    response.status = VERIFICATION_STATUS.PENDING_REVIEW;
    response.image.queued_for_review = true;
    response.message = "Image received and queued for manual review. You will get a follow-up status from a pharmacist.";
  }

  return response;
}

function parseReports(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getReports() {
  if (typeof window === "undefined") return [];
  return parseReports(window.localStorage.getItem(REPORTS_STORAGE_KEY));
}

function saveReports(reports) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export function validateReportPayload(payload = {}) {
  const errors = [];
  const productName = String(payload.productName || "").trim();
  const description = String(payload.description || "").trim();
  const locationText = String(payload.locationText || "").trim();
  const reporterContact = String(payload.reporterContact || "").trim();

  if (!productName) errors.push("Product name is required.");
  if (!description) errors.push("Description is required.");
  if (!locationText && (!payload.coordinates || payload.coordinates.lat == null || payload.coordinates.lng == null)) {
    errors.push("Add location text or both latitude and longitude.");
  }

  if (productName.length > 120) errors.push("Product name is too long (max 120 chars).");
  if (description.length > MAX_TEXT_LENGTH) errors.push("Description is too long (max 1000 chars).");
  if (locationText.length > 160) errors.push("Location text is too long (max 160 chars).");
  if (reporterContact.length > 160) errors.push("Reporter contact is too long (max 160 chars).");

  const nafdacValidation = validateNafdacCode(payload.nafdacCode || "", { required: false });
  if (!nafdacValidation.valid) errors.push(nafdacValidation.error);

  let coordinates = null;
  if (payload.coordinates && (payload.coordinates.lat != null || payload.coordinates.lng != null)) {
    const lat = Number(payload.coordinates.lat);
    const lng = Number(payload.coordinates.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      errors.push("Coordinates must be valid numbers.");
    } else if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      errors.push("Coordinates are out of range.");
    } else {
      coordinates = { lat, lng };
    }
  }

  let photoMetadata = null;
  if (payload.photoFile) {
    const imageValidation = validateImageFile(payload.photoFile);
    if (!imageValidation.valid) {
      errors.push(imageValidation.error);
    } else {
      photoMetadata = imageValidation.metadata;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      product_name: productName,
      nafdac_code: nafdacValidation.normalized || null,
      location_text: locationText || null,
      coordinates,
      description,
      reporter_contact: reporterContact || null,
      photo: photoMetadata,
    },
  };
}

export function submitFakeDrugReport(payload = {}) {
  const validation = validateReportPayload(payload);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  const now = new Date().toISOString();
  const report = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...validation.sanitized,
    moderation_status: "pending",
    created_at: now,
    updated_at: now,
  };

  const reports = [report, ...getReports()];
  saveReports(reports);
  return { ok: true, report };
}

export function listFakeDrugReports({ includeUnverified = true } = {}) {
  const reports = getReports();
  if (includeUnverified) return reports;
  return reports.filter((r) => r.moderation_status === "verified");
}

export function getPublicReportPoints() {
  return listFakeDrugReports({ includeUnverified: true }).map((r) => ({
    id: r.id,
    product_name: r.product_name,
    nafdac_code: r.nafdac_code,
    location_text: r.location_text,
    coordinates: r.coordinates,
    moderation_status: r.moderation_status,
    created_at: r.created_at,
  }));
}

export function updateReportModerationStatus(reportId, moderationStatus) {
  const allowed = ["pending", "verified", "rejected"];
  if (!allowed.includes(moderationStatus)) {
    return { ok: false, error: "Unsupported moderation status." };
  }

  const reports = getReports();
  const nextReports = reports.map((r) => {
    if (r.id !== reportId) return r;
    return { ...r, moderation_status: moderationStatus, updated_at: new Date().toISOString() };
  });

  if (!nextReports.some((r) => r.id === reportId)) {
    return { ok: false, error: "Report not found." };
  }

  saveReports(nextReports);
  return { ok: true };
}

// Phase 2 scaffolding
export const STOCKIST_MODEL_PLACEHOLDER = {
  id: "stk_0001",
  name: "Sample Registered Pharmacy",
  coordinates: { lat: 6.5244, lng: 3.3792 },
  verification_status: "pending",
  last_verified_at: null,
};

export async function queryNearestStockists() {
  return {
    status: "not_implemented",
    message: "Phase 2 stockist locator service boundary is ready for backend integration.",
    stockists: [],
  };
}

export const ADMIN_VALIDATION_HOOKS = {
  reports: ["pending", "verified", "rejected"],
  stockists: ["pending", "verified", "suspended"],
};

// Phase 3 scaffolding
export const SMS_FALLBACK_DESIGN = {
  syntax: {
    check: "CHECK <code>",
    report: "REPORT <code> <location> <description>",
  },
  notes: [
    "SMS parser should normalize NAFDAC code using normalizeNafdacCode.",
    "Responses should reuse VERIFICATION_STATUS values for consistency.",
  ],
};

export function clearStoredReportsForTests() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REPORTS_STORAGE_KEY);
}
