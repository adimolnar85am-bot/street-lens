export type PhotoAssignments = {
  /** Slot key → photo id */
  slots: Record<string, string>;
  /** Slot key → resolved image URL at assignment time (stable on refresh) */
  slotSrcs?: Record<string, string>;
};

export type PhotoSlotDef = {
  key: string;
  label: string;
  section: string;
};

export const EMPTY_PHOTO_ASSIGNMENTS: PhotoAssignments = { slots: {}, slotSrcs: {} };
