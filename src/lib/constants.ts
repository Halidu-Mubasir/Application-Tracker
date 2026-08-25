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

// Tailwind classes per status, used by the StatusBadge component.
export const STATUS_COLOR: Record<ApplicationStatus, string> = {
  RESEARCHING: "bg-muted text-muted-foreground",
  PROF_CONTACTED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  SUBMITTED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  INTERVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  DECISION_PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  WAITLISTED: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  WITHDRAWN: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

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
