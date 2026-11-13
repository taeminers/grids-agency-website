type PrivacyPublication = {
  status: "draft" | "published";
  version: string;
  effectiveDate: string | null;
  legalName: string;
  contactEmail: string;
};

// Complete docs/privacy/operations.md before enabling the initial publication.
// The owner supplied this date with the policy. Draft status still prevents
// publication; reconcile the date if the actual release is later.
export const privacyPublication: PrivacyPublication = {
  status: "draft",
  version: "1.0",
  effectiveDate: "2026-11-13",
  legalName: "그리즈",
  contactEmail: "kyle@gridsagency.com",
};

export const privacyPublished = privacyPublication.status === "published" && Boolean(privacyPublication.effectiveDate);
export const showPrivacyLinks = privacyPublished || process.env.NODE_ENV !== "production";
