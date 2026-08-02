export type MerchPhoto = {
  id: string;
  src: string;
  uploadedAt?: string;
};

export type MerchItemAssignment = {
  photoId: string;
  src: string;
};

export type MerchAssignments = {
  items: Record<string, MerchItemAssignment>;
};

export const EMPTY_MERCH_ASSIGNMENTS: MerchAssignments = { items: {} };
