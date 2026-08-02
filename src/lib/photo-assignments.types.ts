export type PhotoAssignments = {
  slots: Record<string, string>;
};

export type PhotoSlotDef = {
  key: string;
  label: string;
  section: string;
};

export const EMPTY_PHOTO_ASSIGNMENTS: PhotoAssignments = { slots: {} };
