import type { ApplicationStatus, DocumentType, RecommenderStatus } from "@prisma/client";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "RESEARCHING",
  "PROF_CONTACTED",
  "SUBMITTED",
  "INTERVIEW",
  "DECISION_PENDING",
  "ACCEPTED",
  "REJECTED",
  "WAITLISTED",
  "WITHDRAWN",
];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  RESEARCHING: "Researching",
  PROF_CONTACTED: "Prof contacted",
  SUBMITTED: "Submitted",
  INTERVIEW: "Interview",
  DECISION_PENDING: "Decision pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WAITLISTED: "Waitlisted",
  WITHDRAWN: "Withdrawn",
};

// Semantic family per status — the single source of truth for status color
// everywhere it appears (badges, stat cards, list-item accents). "info"
// covers the whole in-progress family (contacted/submitted/interview) as
// one hue, per design direction.
export type StatusFamily = "neutral" | "info" | "warning" | "success" | "danger";

export const STATUS_FAMILY: Record<ApplicationStatus, StatusFamily> = {
  RESEARCHING: "neutral",
  PROF_CONTACTED: "info",
  SUBMITTED: "info",
  INTERVIEW: "info",
  DECISION_PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  WAITLISTED: "warning",
  WITHDRAWN: "neutral",
};

const FAMILY_BADGE_CLASSES: Record<StatusFamily, string> = {
  neutral: "bg-neutral-status-soft text-neutral-status",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export const FAMILY_BAR_CLASSES: Record<StatusFamily, string> = {
  neutral: "bg-neutral-status",
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
};

export const FAMILY_BORDER_CLASSES: Record<StatusFamily, string> = {
  neutral: "border-neutral-status",
  info: "border-info",
  warning: "border-warning",
  success: "border-success",
  danger: "border-danger",
};

// Tailwind classes per status, used by the StatusBadge component.
export const STATUS_COLOR: Record<ApplicationStatus, string> = Object.fromEntries(
  APPLICATION_STATUSES.map((status) => [status, FAMILY_BADGE_CLASSES[STATUS_FAMILY[status]]])
) as Record<ApplicationStatus, string>;

export const DOCUMENT_TYPES: DocumentType[] = [
  "SOP",
  "RESEARCH_PROPOSAL",
  "CV",
  "TRANSCRIPT",
  "WRITING_SAMPLE",
  "LOR",
  "OTHER",
];

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  SOP: "Statement of Purpose",
  RESEARCH_PROPOSAL: "Research Proposal",
  CV: "CV",
  TRANSCRIPT: "Transcript",
  WRITING_SAMPLE: "Writing Sample",
  LOR: "Letter of Recommendation",
  OTHER: "Other",
};

export const RECOMMENDER_STATUSES: RecommenderStatus[] = [
  "ASKED",
  "CONFIRMED",
  "SUBMITTED",
  "DECLINED",
];

export const RECOMMENDER_STATUS_LABEL: Record<RecommenderStatus, string> = {
  ASKED: "Asked",
  CONFIRMED: "Confirmed",
  SUBMITTED: "Submitted",
  DECLINED: "Declined",
};
